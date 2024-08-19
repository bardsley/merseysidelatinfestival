import json
from random import randint
import datetime
import boto3
from boto3.dynamodb.conditions import Key, Attr
import os
import logging
from decimal import Decimal

logger = logging.getLogger()
logger.setLevel("INFO")

# get dynamodb table
# db = boto3.resource('dynamodb')
# table = db.Table('dev-mlf24_attendees')

lambda_client = boto3.client('lambda')

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return str(obj)
        return super().default(obj)

# Turn line items into a array detailing the access the person has i.e. what
# parts of the fetival.
# [Fri-Party, Sat-Class, Sat-Din, Sat-Party, Sun-Class, Sun-Party]
# Will also return a string of the passes the person has purchased.
def process_line_items(line_items):
    access = [0,0,0,0,0,0]
    line_items_return = [] #!TODO This is gonna be more complicated as there's no meta in iZettle
    # for item in line_items['data']:
    #     access_metadata = json.loads(item['price']['product']['metadata']['access'])
    #     access = [sum(i) for i in zip(access, access_metadata)]

    #     line_items_return.append({
    #             'prod_id':item['price']['product']['id'],
    #             'price_id':item['price']['id'],
    #             'description':item['description'],
    #             'amount_total':item['amount_total']
    #         })

    return access, line_items_return

# Main function to handle the event
def process_event(payload, context):
    logger.info(payload)

    CHECKOUT_SESSION_ID = payload['purchaseUuid']
    access, line_items = process_line_items(payload['products'])
    student_ticket = True if "Need to write something" == "To check this" else False
    meal = None
    full_name = 'Unknown'
    email = payload['purchaseUuid']
    phone = 'Unknown'
    
    # Create the ticket
    logger.info("Invoking create_ticket lambda")
    response = lambda_client.invoke(
        FunctionName='api-dev-createTicket',
        InvocationType='Event',
        Payload=json.dumps({
            'email': email,      
            'full_name': full_name,
            'phone':phone,
            'purchase_date': payload['timestamp'],
            'line_items': line_items,
            'access': access,
            'status': "paid_izettle",
            'student_ticket': student_ticket,
            'promo_code': None,
            'meal_preferences': meal,
            'checkout_session': CHECKOUT_SESSION_ID, 
            'schedule': None,
            'heading_message':"THANK YOU FOR YOUR PURCHASE!",
            'send_standard_ticket': False,
            },cls=DecimalEncoder),
        )
    logger.info(response)
            
    return {'statusCode':200, 'body': json.dumps({'message':"Ticket Created"})}

def lambda_handler(event, context):
    # Check we have a body
    if 'body' not in event:
        return {'statusCode': 400, 'body': json.dumps({'error': 'No body in event'})}
    
    ev_data = json.loads(event['body'])
    
    # Check this is the correct event
    if ('eventName' not in ev_data and ev_data['eventName'] != 'PurchaseCreated!'):
        message =  "Event is not a PurchaseCreated event"
        logger.error(message)
        logger.error(ev_data)
        return {'statusCode':400, 'body': json.dumps({ 'error': message})}
    
    payload = json.loads(ev_data['payload'])
    logger.info(payload)

    response = process_event(payload, context)
    # response = payload
    return {'statusCode':200, 'body': json.dumps(response) }