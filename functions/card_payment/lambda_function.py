import json
from random import randint
import datetime
import boto3
from boto3.dynamodb.conditions import Key, Attr
import os
import logging
from decimal import Decimal
from shared import DecimalEncoder as shared

logger = logging.getLogger()
logger.setLevel("INFO")

# get dynamodb table
db = boto3.resource('dynamodb')
table = db.Table(os.environ.get("PRODUCTS_TABLE_NAME"))

lambda_client = boto3.client('lambda')

# Turn line items into a array detailing the access the person has i.e. what
# parts of the fetival.
# [Fri-Party, Sat-Class, Sat-Din, Sat-Party, Sun-Class, Sun-Party]
# Will also return a string of the passes the person has purchased.

#* This really needs to split purchases against till into seperate carts but I am rethinking
#* how we do this as I see complexity in sync already and it's just testing
def process_line_items(line_items):
    access = [0,0,0,0,0,0]
    products = table.scan()['Items']
    logger.info(products)
    logger.info(line_items)
    line_items_return = [] #!TODO This is gonna be more complicated as there's no meta in iZettle
    for item in line_items:
        sku = item['sku']
        logger.info(sku)
        product = list(filter(lambda d: d['prod_name'] == sku, products))
        if(product == []):
            logger.info("Product not found")
        else:
            logger.info(product)
            access_metadata = product[0]['access'] #! Doesnt deal with student product
            logger.info(access_metadata)
            access = [sum(i) for i in zip(access, access_metadata)]

            line_items_return.append({
                'prod_id':item['productUuid'],
                'price_id':item['variantUuid'],
                'description':item['name'],
                'amount_total':item['unitPrice'] * int(item['quantity']),
            })

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
    if(access == [0,0,0,0,0,0]):
        logger.info("No Ticket provided match")
        return {'statusCode':404, 'body': json.dumps({'message':"No products Matched", "purchaseUuid": CHECKOUT_SESSION_ID})}
    else:
        # Create the ticket
        logger.info("Invoking create_ticket lambda")
        response = lambda_client.invoke(
            FunctionName=os.environ.get("CREATE_TICKET_LAMBDA"),
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
                },cls=shared.DecimalEncoder),
            )
        logger.info(response)
            
        return {'statusCode':200, 'body': json.dumps({'message':"Ticket Created"})}

def lambda_handler(event, context):
    # Check we have a body
    if 'body' not in event:
        return {'statusCode': 400, 'body': json.dumps({'error': 'No body in event'})}
    
    ev_data = json.loads(event['body'])
    
    # Check this is the correct event
    # if ('eventName' not in ev_data and ev_data['eventName'] != 'PurchaseCreated!'):
    if ('eventName' not in ev_data and ev_data.get('eventName') != 'PurchaseCreated!'):
        message =  "Event is not a PurchaseCreated event"
        logger.error(message)
        logger.error(ev_data)
        return {'statusCode':400, 'body': json.dumps({ 'error': message})}
    
    payload = json.loads(ev_data['payload'])
    # logger.info(payload)

    response = process_event(payload, context)
    # response = payload
    return {'statusCode':200, 'body': json.dumps(response) }