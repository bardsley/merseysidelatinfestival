import boto3
from boto3.dynamodb.conditions import Key, Attr
import json
import logging
from shared import DecimalEncoder as shared
from json.decoder import JSONDecodeError
import os
import time

logger = logging.getLogger()
logger.setLevel("INFO")

db = boto3.resource('dynamodb')
table = db.Table(os.environ.get("EVENT_TABLE_NAME"))

def err(msg:str, code=400, logmsg=None, **kwargs):
    logmsg = logmsg if logmsg else msg
    logger.error(logmsg)
    for k in kwargs:
        logger.error(k+":"+kwargs[k])
    return {
        'statusCode': code, 
        'body': json.dumps({'error': msg})
        }

def get(event):
    # Lookup table group name to check it
    data = event['queryStringParameters']
    if ('group_id' not in data):
        logger.error("group_id not set")
        return err("Must provide group_id.")
    else:
        group_id = data['group_id']

    logger.info("Looking up table group {}".format(group_id))
    response = table.query(KeyConditionExpression=Key('PK').eq("GROUP#{}".format(group_id)))

    if response['Count'] == 0:
        return {'statusCode': 200, 'body': {'code': 1, 'text': "Group does not exist."}}
    else:
        return {'statusCode': 200, 'body': {'code': 2, 'text': "Group exists."}}

def post(event):
    # create new entry
    try:
        data = json.loads(event['body'])
        logger.info(data)
    except (TypeError, JSONDecodeError) as e:
        logger.error(e)
        return err("An error has occured with the input you have provied.", event_body=event['body'])
    
    if ('ticket_number' not in data) and ('email' not in data) and ('group_id' not in data) and ('timestamp' not in data):
        return err("Must provide ticket_number, email, timestamp, and group_id.")    

    _post(data['group_id'], data['ticket_number'], data['email'], data['timestamp'])

    return True

def _post(group_id, ticket_number, email, timestamp):
    table.put_item(Item={
        'PK': "GROUP#{}".format(group_id),
        'SK': "ATTENDEE#{}".format(ticket_number),
        'email': email,
        'timestamp': timestamp
    })

    return True

def delete(event):
    # delete entry
    try:
        data = json.loads(event['body'])
        logger.info(data)
    except (TypeError, JSONDecodeError) as e:
        logger.error(e)
        return err("An error has occured with the input you have provied.", event_body=event['body'])

    if ('ticket_number' not in data) and ('email' not in data) and ('group_id' not in data):
        return err("Must provide ticket_number, email, and group_id.")    
    
    _delete(data['group_id'], data['ticket_number'])

    return True

def _delete(group_id, ticket_number):    
    table.delete_item(
        Key={
            'PK': "GROUP#{}".format(group_id),
            'SK': "ATTENDEE#{}".format(ticket_number)           
        }
    )
    return True

def patch(event):
    # update an entry i.e. delete old one with old details and make a new one
    try:
        data = json.loads(event['body'])
        logger.info(data)
    except (TypeError, JSONDecodeError) as e:
        logger.error(e)
        return err("An error has occured with the input you have provied.", event_body=event['body'])
    
    _delete(data['old']['group_id'], data['old']['ticket_number'])

    _post(data['new']['group_id'], data['new']['ticket_number'], data['new']['email'], time.time())

    return True

def lambda_handler(event, context):
    '''

    '''    
    logger.info('## NEW REQUEST')
    if event['requestContext']['http']['method'] == 'GET':
        logger.info('## GET')
        return get(event)
    elif event['requestContext']['http']['method'] == 'POST':
        logger.info('## POST')
        return post(event)
    elif event['requestContext']['http']['method'] == 'DELETE':
        logger.info('## DELETE')
        return delete(event)   
    elif event['requestContext']['http']['method'] == 'PATCH':
        logger.info('## PATCH')
        return patch(event)                    
    else:
        logger.info('## Erm....')
        return {
            'statusCode': 405,
            'body': "Method Not Allowed"
        }  