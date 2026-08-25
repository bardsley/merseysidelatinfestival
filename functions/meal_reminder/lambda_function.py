import json
import logging

import boto3
from boto3.dynamodb.conditions import Key, Attr
from shared import DecimalEncoder
import os
import time

## ENV
attendees_table_name = os.environ.get("ATTENDEES_TABLE_NAME")
send_email_lambda    = os.environ.get("SEND_EMAIL_LAMBDA")
event_table_name     = os.environ.get("EVENT_TABLE_NAME")

logger = logging.getLogger()
logger.setLevel("INFO")

# profile_name='danceengine-admin'
# boto3.setup_default_session(profile_name=profile_name)
# logging.basicConfig()

db = boto3.resource('dynamodb')
table = db.Table(attendees_table_name)
event_table = db.Table(event_table_name)

lambda_client = boto3.client('lambda')

def err(msg:str, code=400, logmsg=None, **kwargs):
    logmsg = logmsg if logmsg else msg
    logger.error(logmsg)
    for k in kwargs:
        logger.error(k+":"+kwargs[k])
    return {
        'statusCode': code, 
        'body': json.dumps({'error': msg})
        }
def get_dinner_pass_names():
    return ["2025 Full Pass (with dinner)", "2025 Artist Pass", "2025 Volunteer Pass", "2025 Gala Dinner"]

def extract_pass_type(line_items):
    pass_names = get_dinner_pass_names()
    if len(line_items) == 1:
        return line_items[0]['description']
    else:
        for item in line_items:
            if item['description'] in pass_names:
                return item['description']
    return "unknown"

def lambda_handler(event, context):
    logger.info(f"Event {event}")
    if event['requestContext']['http']['method'] != "POST": return err("Method not allowed, make POST request", code=405)

    response = table.scan(FilterExpression=Key('active').eq(True))

    filtered_items = [item for item in response['Items'] if (item['access'][2] == 1) and ('meal_preferences' not in item or item['meal_preferences'] == None or any(choice == -1 for choice in item['meal_preferences']['choices'])) and extract_pass_type(item.get('line_items', [])) in get_dinner_pass_names()]
    # logger.info(filtered_items)

    #! If no matches should problably return a 404
    for item in filtered_items:
        # send the email with these details
        logger.info("Invoking send_email lambda")
        response = lambda_client.invoke(
            FunctionName=send_email_lambda,
            InvocationType='Event',
            Payload=json.dumps({
                    'email_type':"meal_reminder",
                    'email':item['email'], 
                    'ticket_number':item['ticket_number'], 
                }, cls=DecimalEncoder.DecimalEncoder),
            )
        logger.info(response)

    event_table.put_item(
        Item={
            'PK': "EMAIL#MEALREMINDER".format(),
            'SK': "DETAIL#{}".format(time.time()),
            'timestamp': "{}".format(time.time())
            }
    )        

    return {'statusCode': 200 }

# lambda_handler({'requestContext':{'http':{'method':"GET"}}}, None)