import json
import os
import logging

import boto3
from boto3.dynamodb.conditions import Key, Attr
from shared import DecimalEncoder

logger = logging.getLogger()
logger.setLevel(logging.INFO)

## ENV
event_table_name = os.environ.get("EVENT_TABLE_NAME")
logger.info(event_table_name)

dynamodb_client = boto3.client('dynamodb')
db = boto3.resource('dynamodb')
table = db.Table(event_table_name)

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
    scan_response = table.scan(FilterExpression=Key('PK').begins_with('GROUP#'))

    return {
        'statusCode': 200,
        'body': json.dumps(scan_response, cls=DecimalEncoder.DecimalEncoder)
    }