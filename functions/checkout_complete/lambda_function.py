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
logger = logging.getLogger()
logger.setLevel("INFO")

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

# get dynamodb table
db = boto3.resource('dynamodb')
table = db.Table('mlf24_db')

lambda_client = boto3.client('lambda')

# Turn line items into a array detailing the access the person has i.e. what
# parts of the fetival.
# [Fri-Party, Sat-Class, Sat-Din, Sat-Party, Sun-Class, Sun-Party]
# Will also return a string of the passes the person has purchased.
def process_line_items(line_items):
    access = [0,0,0,0,0,0]
    pass_type = ""
    for item in line_items['data']:
        access_metadata = json.loads(item['price']['product']['metadata']['access'])
        # access = access+access_metadata
        access = [sum(i) for i in zip(access, access_metadata)]
        pass_type += ", "+item['description']
    return access, pass_type[2:]

# Generate a random ticket number
def get_ticket_number():
    search = True
    # generate a new ticket number if it is already used in the table
    while search:
        ticketnumber = randint(1000000000, 9999999999)
        response = table.scan(FilterExpression=Key('ticket_number').eq(ticketnumber))
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
        response = stripe.checkout.Session.retrieve(CHECKOUT_SESSION_ID, expand=['line_items', 'line_items.data.price.product'])
        logger.info(response)

        # process the line items and get the string of items purchased for gsheet
        access, _pass_type = process_line_items(response['line_items'])

        pass_type = _pass_type # will be a comma-seperate list of passes bought including if just an individual option
        
        payment_method  = 'Stripe' # the only method captured by this webhook
        payment_status  = response['payment_status']
        amount          = response['amount_total']/100
        payout_estimate = amount-0.2-(amount*0.015) # estimate how much the payout will be

        # customer information to keep
        ateendee_details = json.loads(response['metadata']['attendee'])
        full_name = ateendee_details['name']
        email     = response['customer_email']
        phone     = ateendee_details['phone']
        
        purchase_date = str(datetime.datetime.utcfromtimestamp(response['created']))
        cs_id = CHECKOUT_SESSION_ID
        
        logger.info("Getting ticket number")
        ticket_number = get_ticket_number()

        Friday_Party     = access[0]
        Saturday_Classes = access[1]
        Saturday_Dinner  = access[2]
        Saturday_Party   = access[3]
        Sunday_Classes   = access[4]
        Sunday_Party     = access[5]

        ticket_used = ''
        meal = json.loads(response['metadata']['preferences']) if 'preferences' in response['metadata'] else None

        # # Put the information into the gsheet
        # gs_response = update_gs([full_name,
        #           pass_type,
        #           payment_method,
        #           payment_status,
        #           amount,
        #           payout_estimate,
        #           email,
        #           phone,
        #           purchase_date,
        #           cs_id,
        #           ticket_number,
        #           Friday_Party, Saturday_Classes, Saturday_Dinner, Saturday_Party, Sunday_Classes, Sunday_Party,
        #           ticket_used])
        
        line_items = []
        logger.info(response['line_items'])
        for item in response['line_items']['data']:
            line_items.append({
                'prod_id':item['id'],
                'description':item['description'],
                'amount_total':item['amount_total']
            })

    
        logger.info(line_items)
        
        # put the information into dynamodb table
        logger.info("Putting data in DynamoDB")
        db_response = update_ddb(Item={
                'email': email,      
                'ticket_number': ticket_number,
                'full_name':full_name,
                'active': True,
                'purchase_date':response['created'],
                'line_items': line_items,
                'access':access,
                'schedule': None,
                'meal_options':meal,
                'ticket_used': ticket_used,
        })
        logger.info(db_response)
        
        
        # send the email with these details
        logger.info("Invoking send_email lambda")
        response = lambda_client.invoke(
            FunctionName='dev-send_email',
            InvocationType='Event',
            Payload=json.dumps({
                    'name':full_name, 
                    'email':email, 
                    'ticket_number':ticket_number, 
                    'line_items':response['line_items']
                }),
            )
        logger.info(response)
            
    return {'statusCode':200}