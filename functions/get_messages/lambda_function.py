import json
import logging
import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError
import os

# Set up logger
logger = logging.getLogger()
logger.setLevel("INFO")

# Constants
DYNAMODB_TABLE      = os.environ.get("EVENT_TABLE_NAME")

# Initialize DynamoDB client
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(DYNAMODB_TABLE)

def lambda_handler(event, context):
    if event['requestContext']['http']['method'] == 'GET':
        try:
            # Query all conversations grouped under a specific PK
            response = table.query(
                KeyConditionExpression=Key('PK').eq('CONVERSATION') & Key('SK').begins_with('CONVERSATION#')
            )
            items = response.get('Items', [])
            
            # Process the result to include only relevant fields
            conversations = [
                {
                    "conversation_id": item['SK'],
                    "name": item.get('name'),
                    "messages": item.get('messages', []),
                    "last_updated": item.get('last_updated')
                }
                for item in items
            ]

            # Return the conversations as JSON
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps(conversations)
            }
        except ClientError as e:
            logger.error(f"Failed to fetch conversations: {e}")
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({"error": "Failed to fetch conversations"})
            }
    else:
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({"error": "Method not allowed"})
        }
