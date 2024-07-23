import stripe
import json
from pprint import pprint
from stripe.error import InvalidRequestError
import os

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

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
                'promo_code': "promo_******"
            }

        #TODO: check that the request containts the required parameters 
        #TODO: double check the requested products do not conflict
        #TODO: handle multiple quantity
        #TODO: change meal to handle being none instead of trying to set it if it does not exist
    '''

    data = json.loads(event['body'])

    # create the custom field for the name and set default text
    custom_fields = [{
        'key': "name",
        'label': {"custom":"Full name on pass", "type":"custom"},
        'type': "text",
        'text':{"default_value":data['name'], 'maximum_length':100, 'minimum_length':3}
    }]

    line_items = []
    
    # make the line items into format for stripe api
    #TODO Make one call to get products
    for item in data['line_items']:
        try:
            prod = stripe.Product.retrieve(item['stripe_product_id'])
            line_items.append({'price':prod['default_price'], 'quantity':1})
        except InvalidRequestError as e:
            # if error occurs with stripe here it is probaly that the product does not exist
            response = {'statusCode':400, 'body':json.dumps({'message':'Product does not exist.', 'error':e.error})}
            return response

    # the input params to generate the checkout session
    kwargs = {
        'customer_email':data['email'],
        'phone_number_collection':{'enabled':'true'},
        'custom_fields':custom_fields,
        'success_url':"https://example.com/success",    # url to return to when checkout complete
        'line_items':line_items,
        'mode':"payment"
        }
        
    # if there is a promo code included then apply it to the cart
    #TODO check validity of the code and handle any other errors (not exist, not apply to that product)
    if data['promo_code'] is not None: kwargs['discounts'] = [{'promotion_code':data['promo_code']}]

    # if the ticket includes dinner then meal options must be provided
    #? assert meal options if dinner is included
    if data['meal'] is not None: kwargs['metadata'] = {'meal': json.dumps(data['meal'])}

    # create the stripe checkout session and put the checkout url in the response body
    try:
        cs = stripe.checkout.Session.create(**kwargs)
        response = {'statusCode':200, 'body':json.dumps({'cs_url':cs['url']})}
    except InvalidRequestError as e:
        # catch an error here if creation fails
        # could be client error but also a server error
        response = {'statusCode':400, 'body':json.dumps({'message':'An error has occured ', 'error':e.error})}

    # if a response hasn't been set already then something has gone wrong with the code
    if response is None: response = {'statusCode':500, 'body':json.dumps({'message':'Something went wrong with the server'})}
    return response


# if __name__ == "__main__":
    
#     meal = {
#         'choices': [1,0,1], 
#         'dietary_requirements':{
#             'selected':["nut allergy", "gluten free"], 
#             'other': "Some specific additional dietary requirement"
#         },
#         'seating_preference': [12345, 12678]
#     }

#     event = {
#         'name': "John Doe",
#         'email': "john_doe@example.com",
#         'number_of_tickets': 1,
#         'meal': meal,
#         'line_items': [
#             {'name': "Party Pass", 'stripe_product_id': "prod_QQTrga8mShkzyo", 'access': [1,0,0,1,0,1]},
#             {'name': "Saturday-Dinner", 'stripe_product_id': "prod_QQUJ8m2jrR6toK", 'access': [0,0,1,0,0,0]}
#         ],
#         'price':100,
#         'promo_code': "promo_1Pf6pnEWkmdeWsQP2Tyg5w2l"
#     }
#     print(lambda_handler({'body':json.dumps(event)}, None))