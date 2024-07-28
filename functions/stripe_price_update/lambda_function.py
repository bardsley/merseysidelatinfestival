import boto3
import json
import logging
import time
import stripe
from boto3.dynamodb.conditions import Key, Attr
import os

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

logger = logging.getLogger()
logger.setLevel("INFO")

# profile_name='AdministratorAccess-645491919786'
# boto3.setup_default_session(profile_name=profile_name)

db = boto3.resource('dynamodb')
table = db.Table('mlf24_stripe_products')

def update_table(input, key):
    UpdateExp   = ""
    ExpAttrVals = {}
    for k in input:
        UpdateExp += ", {} = :{}".format(k, k)
        ExpAttrVals[":"+format(k)] = input[k]

    params = {
        'Key': key,
        'UpdateExpression':'SET '+UpdateExp[2:],
        'ExpressionAttributeValues' : ExpAttrVals
    }

    try:
        logger.info(params)
        response = table.update_item(**params)
        logger.info(response)
        return True
    except db.meta.client.exceptions.ConditionalCheckFailedException as e:
        logger.error(e)
        return False

def lambda_handler(event, context):
    '''
        # price_query = stripe.Price.search(query="active:'true' AND product:'{}'".format(prod_id))

    #TODO handle updates to discount codes too
    #TODO handle price.deleted and ?product.deleted
    '''
    logger.info("#### WEBHOOK TRIGGERED")
    ev_data = json.loads(event['body'])

    if (ev_data['type'] == "price.created") or (ev_data['type'] == "price.updated") or (ev_data['type'] == "price.deleted"):
        logger.info("A change to a price has been detected")
        
        prod_id = ev_data['data']['object']['product']
        price_id = ev_data['data']['object']['id']
        logger.info({'prod_id': prod_id, 'price_id': price_id})

        if not ev_data['data']['object']['active']: 
            logger.info("Deleting a price which is no longer active")
            return table.delete_item(Key={'prod_id': prod_id, 'price_id': price_id})

        price_type = "student" if ev_data['data']['object']['nickname'] == "student_active" else None

        last_update = ev_data['data']['object']['created'] if ev_data['type'] == "price.created" else int(time.time())

        input = {
            'price_type': price_type,
            'active': ev_data['data']['object']['active'],
            'livemode': ev_data['data']['object']['livemode'],
            'last_update': last_update,
            'unit_amount': ev_data['data']['object']['unit_amount']
            }
        
        logger.info("Updating the table with latest data")
        return update_table(input, {'prod_id': prod_id, 'price_id': price_id})

    if ev_data['type'] == "product.updated":
        logger.info("An update to a product has been detected")

        prod_id = ev_data['data']['object']['id']
        price_id = ev_data['data']['object']['default_price']
        logger.info({'prod_id': prod_id, 'price_id': price_id})

        if "default_price" in ev_data['data']['previous_attributes']:

            input = {
                'price_type': "default",
                'active': ev_data['data']['object']['active'],
                'livemode': ev_data['data']['object']['livemode'],
                'last_update': ev_data['data']['object']['updated'],
                'name': ev_data['data']['object']['name'],
                'description': ev_data['data']['object']['description']

            }

            logger.info("The default price has changed, updating the table")
            update_table(input, {'prod_id': prod_id, 'price_id': price_id})

        if 'active' in ev_data['data']['previous_attributes']:
            
            input = {
                'price_type': "default",
                'active': ev_data['data']['object']['active'],
                'livemode': ev_data['data']['object']['livemode'],
                'last_update': ev_data['data']['object']['updated'],
                'name': ev_data['data']['object']['name'],
                'description': ev_data['data']['object']['description']
            }

            logger.info("The active status of the product has changed to {}".format(ev_data['data']['object']['active']))
            update_table(input, {'prod_id': prod_id, 'price_id': price_id})
            
            query = stripe.Price.search(query="active:'true' AND product:'{}'".format(prod_id))
            for item in query['data']:
                if item['nickname'] == "student_active": 
                    student_price = item['id'] 
                    break
                else:
                    student_price = None
            
            if student_price:
                input = {
                    'price_type': "student",
                    'active': ev_data['data']['object']['active'],
                    'livemode': ev_data['data']['object']['livemode'],
                    'last_update': ev_data['data']['object']['updated'],
                    'name': ev_data['data']['object']['name'],
                    'description': ev_data['data']['object']['description']
                }

                logger.info("Updating the status of student price to {}".format(ev_data['data']['object']['active']))
                update_table(input, {'prod_id': prod_id, 'price_id': student_price})

        return True
