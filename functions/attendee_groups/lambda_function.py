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

lambda_client = boto3.client('lambda')

dynamodb_client = boto3.client('dynamodb')
db = boto3.resource('dynamodb')
table = db.Table(os.environ.get("EVENT_TABLE_NAME"))
attendees_table = db.Table(os.environ.get("ATTENDEES_TABLE_NAME"))

def err(msg:str, code=400, logmsg=None, **kwargs):
    logmsg = logmsg if logmsg else msg
    logger.error(logmsg)
    for k in kwargs:
        logger.error(k+":"+kwargs[k])
    return {
        'statusCode': code, 
        'body': json.dumps({'error': msg})
        }

def process_emails(recs, group_id, name):
    # batch get from GROUPREC#groupid
        # if exists and not expire ignore that email
        # with remaining batch get from attendees
        # if has ticket
        #   check if is already in group - discard if it is
        #   send rec email with link to manage ticket
        #   add to db with GROUPREC and expires after 1 week
        # else if not have ticket
        #   send rec with link to buy ticket
        #   add to db with GROUPREC and expires after 1 week
        logger.info("Processing emails for recommendation")

        logger.info("Searching to check if recomemndation email has been sent in the last week")
        keys = [{'PK': {'S': "GROUPREC#{}".format(group_id)}, 'SK': {'S': "EMAIL#{}".format(email)}} for email in recs if (isinstance(email, str)) & ("@" in email)]
        response = dynamodb_client.batch_get_item(
            RequestItems={
                os.environ.get("EVENT_TABLE_NAME"): {
                    'Keys': keys
                }
            }
        )

        retrieved_items =  response.get('Responses', {}).get(os.environ.get("EVENT_TABLE_NAME"), [])
        logger.info(retrieved_items)
        retrieved_emails = {item['SK']['S'].split('#')[1] for item in retrieved_items if int(item.get('expires', '')['N']) > int(time.time())}
        remaining_emails = [email for email in recs if email not in retrieved_emails]

        logger.info("Searhcing if any emails that have not already recieved a recommendation already have a ticket")
        attendee_with_tickets = []
        for email in remaining_emails:
            attendee_response = attendees_table.query(
                KeyConditionExpression=Key('email').eq(email),
                FilterExpression=Attr('active').eq(True)
            )
            if attendee_response.get('Items'):
                attendee_with_tickets.extend(attendee_response['Items'])

        logger.info("Sending emails to recommendations with tickets")
        processed_emails = set()
        for attendee in attendee_with_tickets:
            email = attendee['email']
            if (email not in processed_emails):
                processed_emails.add(email)
                if attendee['meal_preferences']['seating_preference'] != group_id:
                    table.put_item(
                        Item={
                            'PK': "GROUPREC#{}".format(group_id),
                            'SK': "EMAIL#{}".format(attendee['email']),
                            'expires': int(time.time()+604800)
                        }
                    )
                    logger.info("Invoking send_email lambda")
                    response = lambda_client.invoke(
                        FunctionName=os.environ.get("SEND_EMAIL_LAMBDA"),
                        InvocationType='Event',
                        Payload=json.dumps({
                                'email_type':"group_rec",
                                'email':email, 
                                'ticket_number':attendee['ticket_number'], 
                                'group_id':group_id,
                                'name':name
                            }, cls=shared.DecimalEncoder),
                        )

        logger.info("Sending emails for remaining emails without ticketes")
        for email in remaining_emails:
            if email not in processed_emails:
                table.put_item(
                    Item={
                        'PK': "GROUPREC#{}".format(group_id),
                        'SK': "EMAIL#{}".format(email),
                        'expires': int(time.time()+604800)
                    }
                )
                logger.info("Invoking send_email lambda")
                response = lambda_client.invoke(
                    FunctionName=os.environ.get("SEND_EMAIL_LAMBDA"),
                    InvocationType='Event',
                    Payload=json.dumps({
                            'email_type':"group_rec",
                            'email':email, 
                            'group_id':group_id,
                            'name':name
                        }, cls=shared.DecimalEncoder),
                    )
                logger.info(response)       

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
        return {'statusCode': 404, 'body': json.dumps({'code': 1, 'text': "Group does not exist."})}
    else:
        return {'statusCode': 200, 'body': json.dumps({'code': 2, 'text': "Group exists."})}

def post(event):
    # create new entry
    try:
        data = json.loads(event['body'])
        logger.info(data)
    except (TypeError, JSONDecodeError) as e:
        logger.error(e)
        return err("An error has occured with the input you have provied.")
    
    if ('ticket_number' not in data) and ('email' not in data) and ('group_id' not in data) and ('timestamp' not in data):
        return err("Must provide ticket_number, email, timestamp, and group_id.")    

    _post(data['group_id'], data['ticket_number'], data['email'], data['full_name'], data['timestamp'], data['recs'])

    return True

def _post(group_id, ticket_number, email, full_name, timestamp, recs):
    if recs: # recs could be None or []
        process_emails(recs, group_id, full_name)
        
    table.put_item(Item={
        'PK': "GROUP#{}".format(group_id),
        'SK': "ATTENDEE#{}".format(ticket_number),
        'email': email,
        'full_name':full_name,
        'timestamp': int(timestamp)
    })

    return True

def delete(event):
    # delete entry
    try:
        data = json.loads(event['body'])
        logger.info(data)
    except (TypeError, JSONDecodeError) as e:
        logger.error(e)
        logger.info(event['body'])
        return err("An error has occured with the input you have provied.")

    if ('ticket_number' not in data) and ('email' not in data) and ('group_id' not in data):
        return err("Must provide ticket_number, email, and group_id.")    
    
    _delete(data['group_id'], data['ticket_number'])

    return True

def _delete(group_id, ticket_number):    
    response = table.delete_item(
        Key={
            'PK': "GROUP#{}".format(group_id),
            'SK': "ATTENDEE#{}".format(ticket_number)           
        }
    )
    logger.info(response)
    return True

def patch(event):
    # update an entry i.e. delete old one with old details and make a new one
    try:
        data = json.loads(event['body'])
        logger.info(data)
    except (TypeError, JSONDecodeError) as e:
        logger.error(e)
        return err("An error has occured with the input you have provied.", event_body=event['body'])
    
    logger.info("Delete old group entry")
    _delete(data['old']['group_id'], data['old']['ticket_number'])

    logger.info("Make new entry")
    _post(data['new']['group_id'], data['new']['ticket_number'], data['new']['email'], data['new']['full_name'], time.time(), data['recs'])

    return True

def lambda_handler(event, context):
    '''

    '''    
    logger.info('## NEW REQUEST')
    logger.info(event)
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