import json
import logging
import os
import time

import boto3
from boto3.dynamodb.conditions import Key
from shared.DecimalEncoder import DecimalEncoder
from shared.parser import parse_event, validate_event

#ENV
attendees_table_name = os.environ.get("ATTENDEES_TABLE_NAME")
event_table_name     = os.environ.get("EVENT_TABLE_NAME")

logger = logging.getLogger()
logger.setLevel("INFO")

db = boto3.resource('dynamodb')
attendees_table = db.Table(attendees_table_name)
event_table = db.Table(event_table_name) 

lambda_client = boto3.client('lambda')

UPGRADE_MAP = {
    'volunteer_meal': [2]
}

def record_failed_upgrade(event, reason):
    '''
    Records details of a failed upgrade attempt
    '''
    logger.info("Recording failed upgrade attempt.")
    current_time = int(time.time())
    pk = f"UPGRADEFAIL#{event.get('ticket_number', 'unknown')}"
    sk = f"ERROR"

    backup_entry = {
        'PK': pk,
        'SK': sk,
        'timestamp': current_time,
        'email': event.get('email', 'unknown'),
        'full_name': event.get('full_name', 'unknown'),
        'reason': reason,
        'event_details': json.dumps(event, cls=DecimalEncoder)
    }

    try:
        event_table.put_item(Item=backup_entry)
        logger.info("Failed upgrade recorded successfully.")
    except boto3.exceptions.Boto3Error as e:
        logger.error("Error recording failed attempt: %s", str(e))


def is_upgrade_possible(current_access, upgrade_type):
    '''
    Check if an upgrade is possible based on the current access array and upgrade type
    '''
    upgrade_positions = UPGRADE_MAP.get(upgrade_type, [])
    for pos in upgrade_positions:
        if current_access[pos] == 0:
            return True 
    return False

def apply_upgrade(current_access, upgrade_type):
    '''
    Apply the upgrade to the access array
    '''
    upgrade_positions = UPGRADE_MAP.get(upgrade_type, [])
    for pos in upgrade_positions:
        current_access[pos] = 1 
    return current_access

def lambda_handler(event, context):
    # get ticket being upgraded
    # what did they purchase?
    #   check upgrade is possible
    # upgrade the ticket 
    # send confirmation email

    # if can't find the ticket being upgraded:
    #     search again but using email
    #     using context see if it makes sense if any found are

    try:
        event = parse_event(event)
        event = validate_event(event, ['ticket_number', 'upgrade_type', 'source'])
    except (ValueError, TypeError, KeyError) as e:
        logger.error("Event validation failed: %s", str(e))
        logger.error(event)
        return {
            'statusCode': 400,
            'body': f'Invalid input: {str(e)}'
        }


    logger.info("#### UPGRADING TICKET ####")
    logger.info("Event received: %s", json.dumps(event, indent=2, cls=DecimalEncoder))
    
    ticket_number = event['ticket_number']
    upgrade_type = event['upgrade_type']
    source = event.get('source', 'unknown')
    full_name = event.get('full_name', 'unknown')
    logger.info("Processing upgrade for ticket number: %s, upgrade type: %s, source: %s", ticket_number, upgrade_type, source)

    if upgrade_type not in UPGRADE_MAP:
        logger.warning("Unsupported upgrade type: %s", upgrade_type)
        record_failed_upgrade(event, f"Unsupported upgrade type: {upgrade_type}")

        return {
            'statusCode': 400,
            'body': f'Unsupported upgrade type: {upgrade_type}'
        }
    

    response = attendees_table.query(
        IndexName="ticket_number-index", 
        KeyConditionExpression=Key('ticket_number').eq(ticket_number)
    )

    if 'Items' not in response or not response['Items']:
        logger.warning("No ticket found with the provided ticket number")
        record_failed_upgrade(event, "Ticket not found")
        return {
            'statusCode': 404,
            'body': 'Ticket not found'
        }


    ticket = response['Items'][0]
    logger.info("Ticket found: %s", json.dumps(ticket, indent=2, cls=DecimalEncoder))
    
    current_access = ticket.get('access', [])
    if not is_upgrade_possible(current_access, upgrade_type):
        logger.warning("Upgrade not possible for this ticket")
        record_failed_upgrade(event, "Upgrade not possible, access clash")
        return {
            'statusCode': 400,
            'body': 'Upgrade not allowed'
        }

    try:
        ticket['access'] = apply_upgrade(current_access, upgrade_type)
        ticket['history'] = ticket.get('history', []) + [{
            "timestamp": time.time(),
            "action": "upgrade",
            "type": upgrade_type,
            "source": source  # Include source of the upgrade in the history
        }]
        
        logger.info("Updating ticket in DynamoDB...")
        attendees_table.put_item(Item=ticket)
        logger.info("Ticket upgrade successful")

    except boto3.exceptions.Boto3Error as e:
        logger.error("Failed to update ticket in DynamoDB: %s", str(e))
        record_failed_upgrade(event, f"Failed to update ticket: {str(e)}")
        return {
            'statusCode': 500,
            'body': 'Failed to update ticket in database'
        }

    if event.get('send_confirmation', True):
        try:
            logger.info("Invoking send_email lambda function")
            response = lambda_client.invoke(
                FunctionName=os.environ.get("SEND_EMAIL_LAMBDA"),
                InvocationType='Event',
                Payload=json.dumps({
                    'email_type': "ticket_upgrade_notification",
                    'name': ticket['full_name'],
                    'email': ticket['email'],
                    'ticket_number': ticket_number,
                    'upgrade_details': upgrade_type
                }, cls=DecimalEncoder),
            )
            logger.info("Email invocation response: %s", response)

        except boto3.exceptions.Boto3Error as e:
            logger.error("Failed to invoke send_email lambda: %s", str(e))
            record_failed_upgrade(event, f"Failed to send confirmation email: {str(e)}")

    return {
        'statusCode': 200,
        'body': 'Ticket upgraded successfully'
    }    