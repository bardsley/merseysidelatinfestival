import json
import logging

import boto3
from boto3.dynamodb.conditions import Key, Attr
from shared import DecimalEncoder
import os

logger = logging.getLogger()
logger.setLevel("INFO")

profile_name='danceengine-admin'
boto3.setup_default_session(profile_name=profile_name)
logging.basicConfig()

db = boto3.resource('dynamodb')
table = db.Table(os.environ.get("ATTENDEES_TABLE_NAME"))

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

def lambda_handler(event, context):
    logger.info(f"Event {event}")
    if event['requestContext']['http']['method'] != "GET": return err("Method not allowed, make GET request", code=405)

    response = table.scan(FilterExpression=Key('active').eq(True))

    filtered_items = [item for item in response['Items'] if (item['access'][2] == 1) and ('meal_preferences' not in item or item['meal_preferences'] == None or any(choice == -1 for choice in item['meal_preferences']['choices']))]
    # logger.info(filtered_items)

    #! If no matches should problably return a 404
    for item in filtered_items:
        # send the email with these details
        logger.info("Invoking send_email lambda")
        response = lambda_client.invoke(
            FunctionName=os.environ.get("SEND_EMAIL_LAMBDA"),
            InvocationType='Event',
            Payload=json.dumps({
                    'email_type':"meal_reminder",
                    'email':item['email'], 
                    'ticket_number':item['ticket_number'], 
                }, cls=DecimalEncoder.DecimalEncoder),
            )
        logger.info(response)

    return {'statusCode': 200 }

lambda_handler({'requestContext':{'http':{'method':"GET"}}}, None)