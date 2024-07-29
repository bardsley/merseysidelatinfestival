import time

from string import Template
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
profile_name='AdministratorAccess-645491919786'
boto3.setup_default_session(profile_name=profile_name)
logging.basicConfig()
from pprint import pprint

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

def convert_access(access):
    conv = ['Friday Party', 'Saturday Classes', 'Saturday Dinner', 'Saturday Party', 'Sunday Classes', 'Sunday Party']
    comb = [conv[i] for i,l in enumerate(json.loads(access)) if l == 1]
    return comb

def lambda_handler(event, context):
    response = table.scan(FilterExpression=Attr('active').eq(True))
    items = response['Items']    
    # prices = stripe.Price.list(ids=[d['price_id'] for d in items], limit=100, expand=['data.product'])

    # pprint(items)

    passes   = [d for d in items if 'Pass' in d['prod_name']]
    
    passes_sorted = {key: {'default':None, 'student':None} for key in [d['prod_id'] for d in passes if d['price_type'] != None]}

    for i in passes:
        passes_sorted[i['prod_id']][i['price_type']] = i

    lines_passes = []
    # print("-------------------")
    # pprint(passes_sorted)

    for prod in passes_sorted:
        prod = passes_sorted[prod]
        prod['student'] = prod['student'] if prod['student'] != None else prod['default']
        lines_passes.append("\t'{}': {{ cost: {}, studentCost: {}, isAvailable: {}, saving: {}, studentSaving: {}, combination: {}, description: \"{}\", priceId: '{}', studentPriceId: '{}'}},\n".format(
            prod['default']['prod_name'], prod['default']['unit_amount']/100, prod['student']['unit_amount']/100, "true", 1, 1, convert_access(prod['default']['access']), prod['default']['description'], prod['default']['price_id'], prod['student']['price_id'] 
        ))

    # with open("./output_test1.txt", 'w') as f:
    #     f.writelines(lines_passes)        
    
    days = ['Friday', 'Saturday', 'Sunday']
    
    ind_tickets = {day: {prod_id: {'default':None, 'student':None} for prod_id in [d['prod_id'] for d in items if (day in d['prod_name']) & ('Pass' not in d['prod_name'])]} for day in days}

    for item in [d for d in items if 'Pass' not in d['prod_name']]:
        day_name = item['prod_name'].split('-')[0].strip()
        ind_tickets[day_name][item['prod_id']][item['price_type']] = item

    lines_ind_tickets = []
    for day in ind_tickets:
        # day_name = day[0]['prod_name'].split('-')[0].strip()
        lines_ind_tickets.append("\t{}: {{ \n".format(day))
        for prod in ind_tickets[day]:
            prod = ind_tickets[day][prod]
            prod['student'] = prod['student'] if prod['student'] != None else prod['default']
            option = prod['default']['prod_name'].split('-')[-1].strip()
            lines_ind_tickets.append("\t\t {}: {{ cost: {}, studentCost: {}, isAvailable: {}, priceId: '{}', studentPriceId: '{}' }},\n".format(
                option, prod['default']['unit_amount']/100, prod['student']['unit_amount']/100, "true", prod['default']['price_id'], prod['student']['price_id']
            ))
        lines_ind_tickets.append("},\n")

    with open("./pricingDefaults.template", 'r') as file:
        tmpl_f = Template(file.read())
    with open("./pricingDefaults.tsx", 'w') as file:
        new_file = tmpl_f.substitute(individual_tickets=''.join(lines_ind_tickets), passes=''.join(lines_passes))
        file.write(new_file)

    # with open("./output_test2.txt", 'w') as f:
    #     f.writelines(lines)
        
    # print("-------------------")
    # pprint(ind_tickets)        

    # for day in ind_tickets:
    #     for prod in ind_tickets[day]:
    #         prod = passes_sorted[prod]
    #         prod['student'] = prod['student'] if prod['student'] != None else prod['default']
    #     lines_passes.append("\t'{}': {{ cost: {}, studentCost: {}, isAvailable: {}, saving: {}, studentSaving: {}, combination: {}, description: \"{}\", priceId: '{}', studentPriceId: '{}'}},\n".format(
    #         prod['default']['prod_name'], prod['default']['unit_amount'], prod['student']['unit_amount'], "true", 1, 1, convert_access(prod['default']['access']), prod['default']['description'], prod['default']['price_id'], prod['student']['price_id'] 
    #     ))


    # # ind   = [d for d in items if 'Pass' not in d['prod_name']]
    # # ind_sorted = {key: {'default':None, 'student':None} for key in [d['prod_id'] for d in passes if d['price_type'] != None]}

    # friday   = [d for d in items if 'Friday' in d['prod_name']]
    # saturday = [d for d in items if ('Saturday' in d['prod_name']) & ('Pass' not in d['prod_name'])]
    # sunday   = [d for d in items if ('Sunday' in d['prod_name']) & ('Pass' not in d['prod_name'])]
    # # print("-------------------")
    # # pprint(friday)
    # # print("-------------------")
    # # pprint(saturday)    
    # # print("-------------------")
    # # pprint(sunday)    

    # individual_tickets = [friday, saturday, sunday]

    # # pprint(individual_tickets)


    # pprint([d['name'].split('-')[-1].strip() for d in products if ('Saturday' in d['name']) & ('Pass' not in d['name'])])