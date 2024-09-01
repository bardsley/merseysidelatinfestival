import time
import json
import logging
from json.decoder import JSONDecodeError
from decimal import Decimal

import boto3
from boto3.dynamodb.conditions import Key
from shared import DecimalEncoder as shared
import os

logger = logging.getLogger()
logger.setLevel("INFO")

# logging.basicConfig()
# profile_name='AdministratorAccess-645491919786'
# boto3.setup_default_session(profile_name=profile_name)

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
    data = event['queryStringParameters'] 
    if ('email' not in data):
        logger.error("email not set")
        return err("Must provide email.")
    else:
        email = data['email']

    logger.info(f"Send email(s) to {email}")
    response = table.scan(FilterExpression=Key('email').eq(email))
    logger.info(f"Dynamo DB Results to {response}")

    #! If no matches should problably return a 404
    for item in response['Items']:
        # send the email with these details
        logger.info("Invoking send_email lambda")
        response = lambda_client.invoke(
            FunctionName=os.environ.get("SEND_EMAIL_LAMBDA"),
            InvocationType='Event',
            Payload=json.dumps({
                    'email_type':"standard_ticket",
                    'name':item['full_name'], 
                    'email':item['email'], 
                    'ticket_number':item['ticket_number'], 
                    'line_items':item['line_items'],
                    'heading_message': " "
                }, cls=shared.DecimalEncoder),
            )
        logger.info(response)

    return {'statusCode': 200 }