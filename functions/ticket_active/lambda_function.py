import json
import logging
import os
import time

import boto3
from boto3.dynamodb.conditions import Key
from shared.DecimalEncoder import DecimalEncoder
from shared.parser import parse_event, validate_event

# ENV
attendees_table_name = os.environ.get("ATTENDEES_TABLE_NAME")

logger = logging.getLogger()
logger.setLevel("INFO")

db = boto3.resource('dynamodb')
attendees_table = db.Table(attendees_table_name)

def lambda_handler(event, context):
    try:
        event = parse_event(event)
        event = validate_event(event, ['ticket_number', 'requestContext'])
    except (ValueError, TypeError, KeyError) as e:
        logger.error("Event validation failed: %s", str(e))
        logger.error(event)
        return {
            'statusCode': 400,
            'body': f'Invalid input: {str(e)}'
        }

    logger.info("#### TOGGLING TICKET STATUS ####")
    logger.info("Event received: %s", json.dumps(event, indent=2, cls=DecimalEncoder))

    request_path = event.get('requestContext', {}).get('http', {}).get('path', '')
    if '/ticket/activate' in request_path:
        action_type = 'activate'
    elif '/ticket/deactivate' in request_path:
        action_type = 'deactivate'
    else:
        logger.warning("Invalid request path: %s", request_path)
        return {
            'statusCode': 400,
            'body': f'Invalid request path: {request_path}'
        }

    logger.info("Determined action type: %s", action_type)

    ticket_number = event['ticket_number'].strip()

    try:
        response = attendees_table.query(
            IndexName="ticket_number-index",
            KeyConditionExpression=Key('ticket_number').eq(ticket_number)
        )

        if 'Items' not in response or not response['Items']:
            logger.warning("No ticket found with the provided ticket number")
            return {
                'statusCode': 404,
                'body': 'Ticket not found'
            }

        ticket = response['Items'][0]
        logger.info("Ticket found: %s", json.dumps(ticket, indent=2, cls=DecimalEncoder))

        ticket['active'] = True if action_type == 'activate' else False

        ticket['history'] = ticket.get('history', []) + [{
            "timestamp": int(time.time()),
            "action": action_type,
            "source": event.get('source', 'unknown')  # Log source of the request
        }]

        logger.info("Updating ticket in DynamoDB...")
        attendees_table.put_item(Item=ticket)
        logger.info("Ticket status toggle successful")

    except boto3.exceptions.Boto3Error as e:
        logger.error("Failed to update ticket in DynamoDB: %s", str(e))
        return {
            'statusCode': 500,
            'body': 'Failed to update ticket in database'
        }

    return {
        'statusCode': 200,
        'body': f'Ticket {"activated" if action_type == "activate" else "deactivated"} successfully'
    }
