from lambda_function import lambda_handler
import json

meal = {
    'choices': [1,0,1], 
    'dietary_requirements':{
        'selected':["nut allergy", "gluten free"], 
        'other': "Some specific additional dietary requirement"
    },
    'seating_preference': [12345, 12678]
}

event = {
    'name': "John Doe",
    'email': "john_doe@example.com",
    'number_of_tickets': 1,
    'meal': meal,
    'line_items': [
        {'name': "Party Pass", 'stripe_product_id': "prod_QQTrga8mShkzyo", 'access': [1,0,0,1,0,1]},
        {'name': "Saturday-Dinner", 'stripe_product_id': "prod_QQUJ8m2jrR6toK", 'access': [0,0,1,0,0,0]}
    ],
    'price':100,
    'promo_code': "promo_1Pf6pnEWkmdeWsQP2Tyg5w2l"
}

print(lambda_handler({'body':json.dumps(event)}, None))