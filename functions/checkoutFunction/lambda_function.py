import stripe
import json
from pprint import pprint
from stripe.error import InvalidRequestError
import os
import logging
from json.decoder import JSONDecodeError
logger = logging.getLogger()
logger.setLevel("INFO")

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

def err(msg:str, code=400, logmsg=None, **kwargs):
    logmsg = logmsg if logmsg else msg
    logger.error(logmsg)
    for k in kwargs:
        logger.error(k+":"+kwargs[k])
    return {
        'statusCode': code, 
        'body': json.dumps({'error': msg})
        }

def check_products(line_items):
    return

def lambda_handler(event, context):
    '''
    Returns a checkout session link for the requested items. Performs some basic checks on the requested items.

        Parameters:
                event (dict): should contain the key 'body' which is JSON str
                
        Returns:
                response (dict): Contains status code and message body

        Request body format:
            {
                'name': "John Doe",
                'email': "john_doe@example.com",
                'number_of_tickets': 1,
                'line_items': [
                    {'name': "Party Pass", 'stripe_product_id': "prod_*******", 'access': [1,0,0,1,0,1]},
                    {'name': "Saturday-Dinner", 'stripe_product_id': "prod_*******", 'access': [0,0,1,0,0,0]}
                ],
                'price':100,
                'meal': {}, //meal data format (optional)
                'promo_code': "promo_******" //(optional)
            }

        #TODO check the format of meal is correct
        #TODO: handle multiple quantity
    '''

    logger.info('## NEW REQUEST')

    try:
        data = json.loads(event['body'])
    except (TypeError, JSONDecodeError) as e:
        return err("An error has occured with the input you have provied.", event_body=event['body'])

    if ('name' not in data) or ('email' not in data) or ('number_of_tickets' not in data) or ('line_items' not in data) or ('price' not in data):
        return err("Input does not containt the expected values.", event_data=data)

    # create the custom field for the name and set default text
    custom_fields = [{
        'key': "name",
        'label': {"custom":"Full name on pass", "type":"custom"},
        'type': "text",
        'text':{"default_value":data['name'], 'maximum_length':100, 'minimum_length':3}
    }]

    line_items = []
    total_access = [0,0,0,0,0,0]
    
    # make the line items into format for stripe api
    #TODO Make one call to get products
    for item in data['line_items']:
        try:
            prod = stripe.Product.retrieve(item['stripe_product_id'])
            line_items.append({'price':prod['default_price'], 'quantity':data['number_of_tickets']})
            total_access = [sum(i) for i in zip(total_access, item['access'])]
        except InvalidRequestError as e:
            # if error occurs with stripe here it is probaly that the product does not exist
            return err("An error occured when trying to retrieve the requested product", errmsg=e.error)

    if not all(i <=1 for i in total_access):
        return err("An error has occured with your selection, there are conflicting items.", log="Pass selection conlfict.", access=str(total_access))

    # the input params to generate the checkout session
    kwargs = {
        'customer_email':data['email'],
        'phone_number_collection':{'enabled':'true'},
        'custom_fields':custom_fields,
        'success_url':"https://example.com/success",    # url to return to when checkout complete
        'line_items':line_items,
        'mode':"payment"
        }
        
    # if the ticket includes dinner then meal options must be provided
    # if ticket does not include dinner but meal provided send and error
    if (total_access[2] > 0):
        if 'meal' not in data:
            return err("This checkout includes dinner but the prefences are not provided.")
        if data['meal']:
            kwargs['metadata'] = {'meal': json.dumps(data['meal'])} 
        else: 
            return err("This checkout includes dinner but the prefences are not provided.")
    elif (total_access[2] < 1) and ('meal' in data):
        if data['meal']:
            return  err("This checkout does not include dinner but the prefences have been provided.")
    
    # if there is a promo code included then apply it to the cart
    #TODO check validity of the code and handle any other errors (not exist, not apply to that product)
    if 'promo_code' in data:
        if data['promo_code']: kwargs['discounts'] = [{'promotion_code':data['promo_code']}]

    # create the stripe checkout session and put the checkout url in the response body
    try:
        cs = stripe.checkout.Session.create(**kwargs)
        return {'statusCode':200, 'body':json.dumps({'cs_url':cs['url']})}
    except InvalidRequestError as e:
        # catch an error here if creation fails
        # could be client error but also a server error
        return err("An error has occured.", log=e.error)