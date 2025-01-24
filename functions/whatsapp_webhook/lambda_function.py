import json
import logging
import boto3
from botocore.exceptions import ClientError
from datetime import datetime
import os

DYNAMODB_TABLE      = os.environ.get("EVENT_TABLE_NAME")
WHATSAPP_TOKEN      = os.environ.get("WHATSAPP_TOKEN")
VERIFY_TOKEN        = os.environ.get("WHATSAPP_VERIFY_TOKEN")

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(DYNAMODB_TABLE)

def lambda_handler(event, context):
    if event['requestContext']['http']['method'] == 'GET':
        if event["queryStringParameters"]["hub.verify_token"] == VERIFY_TOKEN:
            return {
                'statusCode': 200,
                'body': event["queryStringParameters"]["hub.challenge"]
            }

    if event['requestContext']['http']['method'] == 'POST':
        body = json.loads(event['body'])
        logger.info(f"Received event from webhook: {body}")
        entries = body.get('entry', [])

        for entry in entries:
            changes = entry.get('changes', [])
            for change in changes:
                value = change.get('value', {})
                
                # Handle incoming messages
                messages = value.get('messages', [])
                contacts = value.get('contacts', [])
                if messages and contacts:
                    handle_incoming_messages(messages, contacts)

                # Handle status updates
                statuses = value.get('statuses', [])
                if statuses:
                    handle_message_status_updates(statuses)

        return {
            'statusCode': 200,
            'body': ""
        }


def handle_incoming_messages(messages, contacts):
    contact = contacts[0]
    name = contact['profile']['name']
    wa_id = contact['wa_id']

    # Generate PK and SK
    pk = "CONVERSATION"
    sk = f"CONVERSATION#{wa_id}"

    # Prepare new messages with ISO formatted timestamps
    new_messages = [
        {
            'id': message['id'],
            'from': message['from'],
            'timestamp': datetime.utcfromtimestamp(int(message['timestamp'])).isoformat(),
            'type': message['type'],
            'text': message['text']['body'] if message['type'] == 'text' else None
        }
        for message in messages
    ]

    # ISO format for last_updated
    last_updated_iso = datetime.utcnow().isoformat()

    try:
        # Update DynamoDB item
        response = table.update_item(
            Key={'PK': pk, 'SK': sk},
            UpdateExpression="""
                SET 
                    #name = :name,
                    #last_updated = :last_updated,
                    messages = list_append(if_not_exists(messages, :empty_list), :new_messages)
            """,
            ExpressionAttributeNames={
                '#name': 'name',
                '#last_updated': 'last_updated'
            },
            ExpressionAttributeValues={
                ':name': name,
                ':last_updated': last_updated_iso,
                ':new_messages': new_messages,
                ':empty_list': []
            },
            ReturnValues="UPDATED_NEW"
        )
        logger.info(f"Updated DynamoDB item for new messages: {response}")
    except ClientError as e:
        logger.error(f"Failed to update DynamoDB item for new messages: {e}")


def handle_message_status_updates(statuses):
    return
    logger.info(f"Statuses: {statuses}")
    for status in statuses:
        message_id = status['id']
        message_status = status['status']
        timestamp = datetime.utcfromtimestamp(int(status['timestamp'])).isoformat()

        # Update the corresponding message in DynamoDB
        pk = "CONVERSATION"
        sk = f"CONVERSATION#{status['recipient_id']}"  # Assuming recipient_id is wa_id

        try:
            # Update the message status in DynamoDB
            response = table.update_item(
                Key={'PK': pk, 'SK': sk},
                UpdateExpression="""
                    SET 
                        messages = list_append(
                            if_not_exists(messages, :empty_list),
                            :status_update
                        )
                """,
                ExpressionAttributeValues={
                    ':status_update': [{
                        'id': message_id,
                        'status': message_status,
                        'updated_at': timestamp
                    }],
                    ':empty_list': []
                },
                ReturnValues="UPDATED_NEW"
            )
            logger.info(f"Updated message status in DynamoDB: {response}")
        except ClientError as e:
            logger.error(f"Failed to update message status in DynamoDB: {e}")
