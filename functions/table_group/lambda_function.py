import boto3
from boto3.dynamodb.conditions import Key, Attr
import json
import logging
from shared import DecimalEncoder as shared
import os

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

def get_table_group(group_id):
    '''

    '''
    response = table.query(KeyConditionExpression=Key('PK').eq("TABLEGROUP#{}".format(group_id)))
    if response['Count'] == 0: 
        logger.info("Table group does not exist")
        return None
    else:
        return response['Count'], response['Items'][0]

def post(event):
    return

def get(event):
    # Lookup table group name to check it
    data = event['queryStringParameters']
    if ('group_id' not in data):
        logger.error("group_id nott set")
        return err("Must provide group_id.")
    else:
        group_id = data['group_id']

    logger.info("Looking up table group {}".format(group_id))
    try:
        count, group_object = get_table_group(group_id)
    except ValueError as e:
        err(str(e))
    
    if group_object == None:
        return     {'statusCode': 200, 'body': {'code': 1, 'text': "Group does not exist."}}
    else:
        if count >= group_object['capacity']:
            return {'statusCode': 200, 'body': {'code': 2, 'text': "Group is full."}}
        elif count < group_object['capacity']:
            if data['group_id'] == True:
                add()
                return {'statusCode': 200, 'body': {'code': 3, 'text': "Group exists and is not full. Users place reserved in group."}}
            elif data['group_id'] == False:
                return {'statusCode': 200, 'body': {'code': 4, 'text': "Group exists and is not full."}}

def patch(event):
    # update an already entered table group entry
    return

def lambda_handler(event, context):
    '''

    '''    
    logger.info('## NEW REQUEST')
    if event['requestContext']['http']['method'] == 'POST':
        logger.info('## POST')
        return post(event)
    elif event['requestContext']['http']['method'] == 'GET':
        logger.info('## GET')
        return get(event)
    elif event['requestContext']['http']['method'] == 'PATCH':
        logger.info('## PATCH')
        return patch(event)            
    else:
        logger.info('## Erm....')
        return {
            'statusCode': 405,
            'body': "Method Not Allowed"
        }  