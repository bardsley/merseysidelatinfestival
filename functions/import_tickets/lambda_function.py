import json
import boto3
from boto3.dynamodb.conditions import Key, Attr
from random import randint

import logging
from decimal import Decimal
from shared import DecimalEncoder as shared
from json.decoder import JSONDecodeError
import os
from datetime import datetime
import time


logger = logging.getLogger()
logger.setLevel(logging.INFO)

lambda_client = boto3.client('lambda')
db = boto3.resource('dynamodb')
table = db.Table(os.environ.get("ATTENDEES_TABLE_NAME"))

def err(msg:str, code=400, logmsg=None, **kwargs):
    logmsg = logmsg if logmsg else msg
    logger.error(logmsg)
    for k in kwargs:
        logger.error(k+":"+kwargs[k])
    return {
        'statusCode': code, 
        'body': json.dumps({'error': msg})
        }

def send_email(name, email, ticket_number, line_items):
    logger.info(os.environ.get("SEND_EMAIL_LAMBDA"))
    # send the email with these details
    logger.info("Invoking send_email lambda")
    response = lambda_client.invoke(
        FunctionName=os.environ.get("SEND_EMAIL_LAMBDA"),
        InvocationType='Event',
        Payload=json.dumps({
                'email_type':"standard_ticket",
                'name':name, 
                'email':email, 
                'ticket_number': ticket_number,
                'line_items':line_items,
                'heading_message': "A REMINDER OF YOUR TICKET"
            }, cls=shared.DecimalEncoder),
        )
    logger.info(response)

def get_line_items(passes, amount_total):
    return [{"amount_total": amount_total, "description": i,"price_id": "","prod_id": ""} for i in passes]

def get_ticket_number(email, student_ticket):
    search = True
    # generate a new ticket number if it is already used in the table
    while search:
        ticketnumber = str(randint(1000000000, 9999999999)) if student_ticket == False else str(55)+str(randint(1000000000, 9999999999))[:-2]
        response = table.query(KeyConditionExpression=Key('ticket_number').eq(ticketnumber) & Key('email').eq(email))
        if response['Count'] == 0:
            search = False
    logger.info("ticket number generated: "+str(ticketnumber))
    return ticketnumber

def update_ddb(Item):
    table.put_item(Item=Item)
    return True

def lambda_handler(event, context):
    try:
        data = json.loads(event['body'])
        logger.info(data)
    except (TypeError, JSONDecodeError) as e:
        logger.error(e)
        return err("An error has occured with the input you have provied.", event_body=event['body'])
    
    attendees = data['attendees']
    options   = data['options']

    for attendee in attendees:
        line_items = get_line_items(attendee['passes'], attendee['unit_amount'])
        ticket_number = str(attendee['ticket_number']) if attendee['ticket_number'] is not None else str(get_ticket_number(attendee['email'], attendee['student_ticket']))
        purchased_at = int(time.mktime(datetime.strptime(attendee['purchased_at'], '%Y-%m-%dT%H:%M:%S.000Z').timetuple()))
        input = {
            'ticket_number': ticket_number,
            'email': attendee['email'],      
            'full_name':attendee['name'],
            'phone': attendee['phone'],
            'active': True,
            'purchase_date':purchased_at,
            'line_items': line_items,
            'access':[1,1,1,1,1,1] if 'Full Pass' in attendee['passes'] else [0,0,0,0,0,0],
            'ticket_used': False,
            'status':attendee['status'],
            'student_ticket': attendee['student_ticket'],
            'schedule': None,
            'checkout_session':attendee['cs_id'] if 'cs_id' in attendee else None,
            'meal_preferences': None,
            'promo_code': None,
            'history': None,
        }

        respponse = update_ddb(input)

        if options['sendTicketEmails'] == "everyone":
            send_email(attendee['name'], attendee['email'], ticket_number, line_items)
        elif options['sendTicketEmails'] == "new":
            if str(attendee['ticket_number']) is None:
                send_email(attendee['name'], attendee['email'], ticket_number, line_items)

    return {
        'statusCode': 200,
    }
