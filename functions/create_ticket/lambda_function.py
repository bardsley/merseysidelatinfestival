import stripe
import json
# from gdrivewrite import update_gs
# from sendmail import sendemail
from random import randint
import datetime
import boto3
from boto3.dynamodb.conditions import Key, Attr
from decimal import Decimal
import os
import logging
logger = logging.getLogger()
logger.setLevel("INFO")

logging.basicConfig()
profile_name='AdministratorAccess-645491919786'
boto3.setup_default_session(profile_name=profile_name)

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

# get dynamodb table
db = boto3.resource('dynamodb')
table = db.Table('dev-mlf24_attendees')

lambda_client = boto3.client('lambda')

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return str(obj)
        return super().default(obj)

def process_line_items(line_items):
    return ''.join([", "+i['description'] for i in line_items])[2:], sum([i['amount_total'] for i in line_items])

# Generate a random ticket number
#! this bit could be done quicker
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

# put the corresponding data into the dynamodb table
def update_ddb(Item):
    table.put_item(Item=Item)
    return True

# Main function to handle the event
def lambda_handler(event, context):
    '''
    {
    'email': "john_doe@example.com",      
    'full_name': "John Doe",
    'purchase_date': 1721571296,
    'line_items': {[
        'amount_total': 4500,
        'description': 'Party Pass',
        'price_id': "price_xxxxx"
    }],
    'access': [1,0,0,1,0,1],
    'status': "paid_stripe"|"paid_cash"|"refunded_stripe"|"refunded_cash",
    'student_ticket': True|False,
    'promo_code': None|{
        'code': "MLF",
        'value': 500
    },
    'meal_preferences': None|{},
    'checkout_session': None|"cs_xxxxxx", 
    'schedule': {},
    'heading_message':"THANK YOU FOR YOUR PURCHASE",
    'send_standard_ticket': True|False,
    }
    '''

    logger.info("#### GENERATING A NEW TICKET ####")
    logger.info(event)

    # process the line items and get the string of items purchased for gsheet

    full_name = event['full_name']
    email     = event['email']
    phone     = event['phone']
    
    logger.info("Getting ticket number")
    ticket_number = get_ticket_number(email, event['student_ticket'])

    # put the information into dynamodb table
    logger.info("Putting ticket into DynamoDB")
    Item = {
        'ticket_number': str(ticket_number),
        'email': event['email'],      
        'full_name':event['full_name'],
        'phone': event['phone'],
        'active': True,
        'purchase_date':event['purchase_date'],
        'line_items': event['line_items'],
        'access':event['access'],
        'ticket_used': False,
        'status':event['status'],
        'student_ticket': event['student_ticket'],
        'schedule': event['schedule'] if 'schedule' in event else None,
        'checkout_session':event['checkout_session'] if 'checkout_session' in event else None,
        'meal_preferences':event['meal_preferences'] if 'meal_preferences' in event else None,
        'promo_code':event['promo_code'] if 'promo_code' in event else None,
    }
    update_ddb = table.put_item(Item=Item)
    logger.info(update_ddb)
    
    if ('send_standard_ticket' in event):
        if event['send_standard_ticket']:
            # send the email with these details
            logger.info("Invoking send_email lambda")
            response = lambda_client.invoke(
                FunctionName='dev-send_email',
                InvocationType='Event',
                Payload=json.dumps({
                        'email_type':"standard_ticket",
                        'name':event['full_name'], 
                        'email':event['email'], 
                        'ticket_number':ticket_number, 
                        'line_items':event['line_items'],
                        'heading_message': event['heading_message'] if 'heading_message' in event else "THANK YOU FOR YOUR PURCHASE!"
                    }, cls=DecimalEncoder),
                )
            logger.info(response)

    #! GOOGLE SHEET
    # pass_type, total = process_line_items(event['line_items'])
    # purchase_date = str(datetime.datetime.utcfromtimestamp(response['created']))
    # # Put the information into the gsheet
    # gs_response = update_gs([full_name,
    #           pass_type,
    #           payment_method,
    #           payment_status,
    #           amount,
    #           amount-0.2-(amount*0.015),
    #           email,
    #           phone,
    #           str(datetime.datetime.utcfromtimestamp(response['created'])),
    #           cs_id,
    #           ticket_number,
    #           access[0], access[1], access[2], access[3], access[4], access[5],
    #           ticket_used])
            
    return {'statusCode':200}