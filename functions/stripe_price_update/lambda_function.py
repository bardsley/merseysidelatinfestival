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
table = db.Table(os.environ.get("PRODUCTS_TABLE_NAME"))

def update_table(input, key):
    if key['price_id'] is None:
        query = stripe.Price.search(query="product:'{}'".format(key['prod_id']))
        logger.info("No default price, updating each price that exists ")
        for item in query['data']:
            _update_table(input, {'prod_id': key['prod_id'], 'price_id': item['id']}, condition='attribute_exists(price_id)') 
    else:
        _update_table(input, key, condition=None)

def _update_table(input, key, condition=None):
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

    if condition:
        params['ConditionExpression'] = condition

    try:
        logger.info(params)
        response = table.update_item(**params)
        logger.info(response)
        return True
    except db.meta.client.exceptions.ConditionalCheckFailedException as e:
        logger.error("The price does not exist in the table")
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

        if ev_data['type'] == "price.deleted": 
            logger.info("Deleting a price which has been deleted from Stripe")
            return table.delete_item(Key={'prod_id': prod_id, 'price_id': price_id})

        price_type = "student" if ev_data['data']['object']['nickname'] == "student_active" else None

        last_update = ev_data['data']['object']['created'] if ev_data['type'] == "price.created" else int(time.time())

        stripe_product = stripe.Product.retrieve(prod_id)

        input = {
            # 'price_type': price_type,
            # 'active': ev_data['data']['object']['active'],
                'product_active': stripe_product['active'],
                'price_active': ev_data['data']['object']['active'],
            'livemode': ev_data['data']['object']['livemode'],
            'last_update': last_update,
            'unit_amount': ev_data['data']['object']['unit_amount'],

            'prod_name': stripe_product['name'],
            'description': stripe_product['description'],
            'access': stripe_product['metadata']['access']
            }
        if price_type: input['price_type'] = price_type
        
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
                # 'active': ev_data['data']['object']['active'],
                    'product_active': ev_data['data']['object']['active'],
                    'price_active': ev_data['data']['object']['active'],
                'livemode': ev_data['data']['object']['livemode'],
                'last_update': ev_data['data']['object']['updated'],
                'prod_name': ev_data['data']['object']['name'],
                'description': ev_data['data']['object']['description'],
                'access': ev_data['data']['object']['metadata']['access']
            }

            logger.info("The default price has changed, updating the table with new default")
            update_table(input, {'prod_id': prod_id, 'price_id': price_id})

        if ('active' in ev_data['data']['previous_attributes']) or ('updated' in ev_data['data']['previous_attributes']):
            
            input = {
                'price_type': "default",
                # 'active': ev_data['data']['object']['active'],
                    'product_active': ev_data['data']['object']['active'],
                    'price_active': ev_data['data']['object']['active'],
                'livemode': ev_data['data']['object']['livemode'],
                'last_update': ev_data['data']['object']['updated'],
                'prod_name': ev_data['data']['object']['name'],
                'description': ev_data['data']['object']['description'],
                'access': ev_data['data']['object']['metadata']['access']
            }

            logger.info("The active status of the product has changed to {}".format(ev_data['data']['object']['active']))
            update_table(input, {'prod_id': prod_id, 'price_id': price_id})
            
            query = stripe.Price.search(query="active:'true' AND product:'{}'".format(prod_id))
            student_price = None
            for item in query['data']:
                if item['nickname'] == "student_active": 
                    student_price = item
                    break
            
            if student_price:
                input = {
                    'price_type': "student",
                    # 'active': ev_data['data']['object']['active'],
                         'product_active': ev_data['data']['object']['active'],
                         'price_active': student_price['active'],
                    'livemode': ev_data['data']['object']['livemode'],
                    'last_update': ev_data['data']['object']['updated'],
                    'prod_name': ev_data['data']['object']['name'],
                    'description': ev_data['data']['object']['description'],
                    'access': ev_data['data']['object']['metadata']['access']
                }

                logger.info("Updating the status of student price to {}".format(ev_data['data']['object']['active']))
                update_table(input, {'prod_id': prod_id, 'price_id': student_price['id']})

        return True
