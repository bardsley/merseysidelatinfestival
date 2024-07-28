import stripe
import json
import logging
import boto3
import os
from boto3.dynamodb.conditions import Key, Attr
logger = logging.getLogger()
logger.setLevel("INFO")

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

#* This is not required for deployment only needed for local testing 
# profile_name='AdministratorAccess-645491919786'
# boto3.setup_default_session(profile_name=profile_name)
# logging.basicConfig()
# from pprint import pprint

db = boto3.resource('dynamodb')
table = db.Table('mlf24_stripe_products')


'''
format
    pass format:
    'Saturday Pass': { cost: 95, studentCost: 85, isAvailable: true, saving: 22, studentSaving: 32, combination: ['Saturday Classes', 'Saturday Party', 'Saturday Dinner'], description: "The whole Saturday experience", priceId: 'price_1PZcrKEWkmdeWsQPl1h22Dk4'},

    individual tickets:
    Friday: {
        Party:   { cost: 15, studentCost: 10, isAvailable: true,  priceId: '' },
        Classes: { cost: 0,  studentCost: 0,  isAvailable: false, priceId: '' },
        Dinner:  { cost: 0,  studentCost: 0,  isAvailable: false, priceId: '' }
    },
'''

def lambda_handler(event, context):
    response = table.scan(FilterExpression=Attr('active').eq(True))
    items = response['Items']
    
    prices = stripe.Price.list(ids=[d['price_id'] for d in items], limit=100, expand=['data.product'])

    pprint(prices)

    passes   = [d for d in prices if 'Pass' in d['product']['name']]

    pprint(passes)

    # friday   = [d for d in products if 'Friday' in d['name']]
    # saturday = [d for d in products if ('Saturday' in d['name']) & ('Pass' not in d['name'])]
    # sunday   = [d for d in products if ('Sunday' in d['name']) & ('Pass' not in d['name'])]

    # individual_tickets = [friday, saturday, sunday]

    # for day in individual_tickets:
    #     lines = []
    #     day = day[0]['name'].split('-')[0].strip()
    #     for prod in day:
    #         option = prod['name'].split('-')[-1].strip()
    #         lines.append("{}: {{ cost: {}, studentCost: {}, isAvailable: {}, priceId: {}, studentPriceId: {} }},".format(
    #             option, prod.
    #         ))

    # pprint([d['name'].split('-')[-1].strip() for d in products if ('Saturday' in d['name']) & ('Pass' not in d['name'])])