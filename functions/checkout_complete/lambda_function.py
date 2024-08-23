import stripe
import json
# from gdrivewrite import update_gs
# from sendmail import sendemail
from random import randint
import datetime
import boto3
from boto3.dynamodb.conditions import Key, Attr
import os
import logging
from decimal import Decimal
from shared import DecimalEncoder as shared
# from json.decoder import JSONDecodeError

# class DecimalEncoder(json.JSONEncoder):
#     def default(self, obj):
#         if isinstance(obj, Decimal):
#             if float(obj) == int(obj):
#                 return int(obj)
#             elif str(float(obj)) == str(obj):
#                 return float(obj)
#             else:
#                 return float(obj)
#         return super().default(obj)

logger = logging.getLogger()
logger.setLevel("INFO")

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

# get dynamodb table
db = boto3.resource('dynamodb')
table = db.Table(os.environ.get("ATTENDEES_TABLE_NAME"))

lambda_client = boto3.client('lambda')
# class DecimalEncoder(json.JSONEncoder):
#     def default(self, obj):
#         if isinstance(obj, Decimal):
#             return str(obj)
#         return super().default(obj)

# Turn line items into a array detailing the access the person has i.e. what
# parts of the fetival.
# [Fri-Party, Sat-Class, Sat-Din, Sat-Party, Sun-Class, Sun-Party]
# Will also return a string of the passes the person has purchased.
def process_line_items(line_items):
    access = [0,0,0,0,0,0]
    line_items_return = []
    for item in line_items['data']:
        access_metadata = json.loads(item['price']['product']['metadata']['access'])
        access = [sum(i) for i in zip(access, access_metadata)]

        line_items_return.append({
                'prod_id':item['price']['product']['id'],
                'price_id':item['price']['id'],
                'description':item['description'],
                'amount_total':item['amount_total']
            })

    return access, line_items_return

# Main function to handle the event
def lambda_handler(event, context):
    logger.info(event)
    # get event data
    ev_data = json.loads(event['body'])
    # ev_data = event['body'] # for use if testing with input as json already

    # Only execute for a completed checkout session
    if ev_data['type'] == "checkout.session.completed":
        # get the checkout session ID
        CHECKOUT_SESSION_ID = ev_data['data']['object']['id']
                  
        # retrieve the full checkout session including the line items
        #! catch error is checkout session does not exist
        logger.info("Retrieve Stripe checkout session")
        stripe_response = stripe.checkout.Session.retrieve(CHECKOUT_SESSION_ID, expand=['line_items', 'line_items.data.price.product'])
        logger.info(stripe_response)

        access, line_items = process_line_items(stripe_response['line_items'])
        student_ticket = True if stripe_response['line_items']['data'][0]['price']['nickname' ] == "student_active" else False
        meal = json.loads(stripe_response['metadata']['preferences']) if 'preferences' in stripe_response['metadata'] else None

        # customer information to keep
        ateendee_details = json.loads(stripe_response['metadata']['attendee'])
        full_name = ateendee_details['name']
        email     = stripe_response['customer_email']
        phone     = ateendee_details['phone']

        # Create the ticket
        logger.info("Invoking create_ticket lambda")
        response = lambda_client.invoke(
            FunctionName=os.environ.get("CREATE_TICKET_LAMBDA"),
            InvocationType='Event',
            Payload=json.dumps({
                'email': email,      
                'full_name': full_name,
                'phone':phone,
                'purchase_date': str(stripe_response['created']),
                'line_items': line_items,
                'access': access,
                'status': "paid_stripe",
                'student_ticket': student_ticket,
                'promo_code': None,
                'meal_preferences': meal,
                'checkout_session': CHECKOUT_SESSION_ID, 
                'schedule': None,
                'heading_message':"THANK YOU FOR YOUR PURCHASE!",
                'send_standard_ticket': True,
                },cls=shared.DecimalEncoder),
            )
        logger.info(response)
            
    return {'statusCode':200}