import json
import logging
import http.client
import boto3
from datetime import datetime
from botocore.exceptions import ClientError
import os

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Constants
DYNAMODB_TABLE      = os.environ.get("EVENT_TABLE_NAME")
WHATSAPP_TOKEN      = os.environ.get("WHATSAPP_TOKEN")
WHATSAPP_NUMBER     = os.environ.get("WHATSAPP_NUMBER")

# Initialize DynamoDB
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(DYNAMODB_TABLE)

def send_reply(to, reply_message):
    """
    Sends a reply message using the WhatsApp Business API.

    Args:
        to (str): The recipient's phone number.
        reply_message (str): The message to send.

    Returns:
        dict: The response from the WhatsApp Business API.
    """
    url_path = f"/v16.0/{WHATSAPP_NUMBER}/messages"
    payload = json.dumps({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "text",
        "text": {"body": reply_message}
    })
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {WHATSAPP_TOKEN}"
    }

    try:
        # Create a connection to the Facebook Graph API
        conn = http.client.HTTPSConnection("graph.facebook.com")
        
        # Send the POST request
        conn.request("POST", url_path, payload, headers)
        
        # Get the response
        response = conn.getresponse()
        response_data = response.read()
        conn.close()

        # Check response status
        if response.status < 200 or response.status >= 300:
            logger.error(f"Failed to send message to {to}. Status: {response.status}, Response: {response_data.decode()}")
            return {"error": f"HTTP {response.status}", "details": response_data.decode()}

        logger.info(f"Message sent successfully to {to}. Response: {response_data.decode()}")
        return json.loads(response_data.decode())

    except Exception as e:
        logger.error(f"Failed to send message to {to}. Error: {e}")
        return {"error": str(e)}

def update_message_in_dynamodb(to, message_id, reply_message):
    """
    Updates the DynamoDB entry with the sent message.

    Args:
        to (str): The recipient's phone number.
        message_id (str): The ID of the sent message.
        reply_message (str): The content of the reply message.
    """
    pk = "CONVERSATION"
    sk = f"CONVERSATION#{to}"
    timestamp = datetime.utcnow().isoformat()

    message_entry = {
        'id': message_id,
        'from': WHATSAPP_NUMBER,
        'timestamp': timestamp,
        'type': 'text',
        'text': reply_message
        }

    try:
        # Update DynamoDB
        response = table.update_item(
            Key={'PK': pk, 'SK': sk},
            UpdateExpression="""
                SET 
                    #last_updated = :last_updated,
                    messages = list_append(if_not_exists(messages, :empty_list), :new_message)
            """,
            ExpressionAttributeNames={
                '#last_updated': 'last_updated'
            },
            ExpressionAttributeValues={
                ':last_updated': timestamp,
                ':new_message': [message_entry],
                ':empty_list': []
            },
            ReturnValues="UPDATED_NEW"
        )
        logger.info(f"Message added to DynamoDB: {response}")
    except ClientError as e:
        logger.error(f"Failed to update DynamoDB item for {to}. Error: {e}")

def lambda_handler(event, context):
    try:
        # Extracting parameters from the event request
        body = json.loads(event.get('body', '{}'))
        to = body.get("to")
        reply_message = body.get("reply_message")

        # Validate input parameters
        if not all([to, reply_message]):
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing required parameters"})
            }

        # Send the reply using the send_reply function
        response = send_reply(to, reply_message)

        # Check if the message was sent successfully
        if "error" not in response and "messages" in response:
            message_id = response['messages'][0]['id']
            # Update DynamoDB with the sent message
            update_message_in_dynamodb(to, message_id, reply_message)

        return {
            "statusCode": 200 if "error" not in response else 500,
            "body": json.dumps(response)
        }

    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
