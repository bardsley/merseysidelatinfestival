import time
import os
import json
import logging
from datetime import datetime
from string import Template

import boto3
from boto3.dynamodb.conditions import Attr
import stripe
from github import Auth, Github, InputGitAuthor

logger = logging.getLogger()
logger.setLevel(logging.INFO)

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")
auth = Auth.Token(os.environ.get("GITHUB_TOKEN"))
git = Github(auth=auth)
git.get_user().login
git_user_login = git.get_user().login

db = boto3.resource('dynamodb')
table = db.Table('mlf24_stripe_products')

def get_blank(prod):
    prod['price_active'] = False
    return prod

def calc_total(ind_tickets, prod):
    access = json.loads(prod['default']['access'])
    conv = ['Friday Party', 'Saturday Classes', 'Saturday Dinner', 'Saturday Party', 'Sunday Classes', 'Sunday Party']
    
    total = sum([ind_tickets[conv[i].split(' ')[0].strip()][conv[i].split(' ')[-1].strip()]['default']['unit_amount'] for i,l in enumerate(access) if l == 1]) 
    studentTotal = 0
    for i,l in enumerate(access):
        if l == 1:
            prod_student = ind_tickets[conv[i].split(' ')[0].strip()][conv[i].split(' ')[-1].strip()]['student']
            prod_student = prod_student if prod_student is not None else ind_tickets[conv[i].split(' ')[0].strip()][conv[i].split(' ')[-1].strip()]['default']
            studentTotal += prod_student['unit_amount']
    return total, studentTotal

def convert_access(access):
    conv = ['Friday Party', 'Saturday Classes', 'Saturday Dinner', 'Saturday Party', 'Sunday Classes', 'Sunday Party']
    return [conv[i] for i,l in enumerate(json.loads(access)) if l == 1]

def format_passes_line(prod, ind_tickets):
    prod['student'] = prod['student'] if prod['student'] is not None else prod['default']
    total, studentTotal = calc_total(ind_tickets, prod)
    return "\t'{}': {{\n\t\t cost: {},\n\t\t studentCost: {},\n\t\t isAvailable: {},\n\t\t saving: {},\n\t\t studentSaving: {},\n\t\t combination: {},\n\t\t description: \"{}\",\n\t\t priceId: '{}',\n\t\t studentPriceId: '{}'}},\n".format(
        prod['default']['prod_name'], 
        prod['default']['unit_amount']/100, 
        prod['student']['unit_amount']/100, 
        "true" if prod['default']['price_active'] else "false", 
        (total/100) - (prod['default']['unit_amount']/100), 
        (studentTotal/100) - (prod['student']['unit_amount']/100), 
        convert_access(prod['default']['access']), 
        prod['default']['description'], 
        prod['default']['price_id'], 
        prod['student']['price_id']
    )

def format_ind_tickets_line(prod):
    option  = prod['default']['prod_name'].split('-')[-1].strip()
    default = prod['default'] if prod['default']['price_active'] else get_blank(prod)
    student = prod['student'] if (prod['student'] is not None) and (prod['student']['price_active'] is not None) else default

    return "\t\t {}:{{\n\t\t\t cost: {},\n\t\t\t studentCost: {},\n\t\t\t isAvailable: {},\n\t\t\t priceId: '{}',\n\t\t\t studentPriceId: '{}'\n\t\t\t }},\n".format(
        option, 
        default['unit_amount']/100, 
        student['unit_amount']/100, 
        "true" if default['price_active'] else "false", 
        default['price_id'],
        student['price_id']
    )

def lambda_handler(event, context):
    # Get all products which are active
    # response = table.scan(FilterExpression=Attr('active').eq(True))

    # get all the products
    response = table.scan()
    items = response['Items']    

    #! create this array automatically    
    days = ['Friday', 'Saturday', 'Sunday']
    
    # do a similar thing as before but for individual tickets but with a container dict which is each day containg
    # the prod_ids associated with that day. and then the subsequent prices
    logger.debug("Creating empty dict for individual tickets")
    ind_tickets = {day: {item_type: {'default':None, 'student':None} for item_type in [d['prod_name'].split('-')[-1].strip() for d in items if (day in d['prod_name']) & ('Pass' not in d['prod_name']) & (d['product_active']) & (d['price_type'] is not None)]} for day in days}

    logger.debug(ind_tickets)

    # sort the individual tickets
    logger.debug("Sorting tickets")
    for item in [d for d in items if 'Pass' not in d['prod_name']]:
        day_name = item['prod_name'].split('-')[0].strip() # get which day this current ticket belongs to
        ind_tickets[day_name][item['prod_name'].split('-')[-1].strip()][item['price_type']] = item # put the item in the right place

    logger.debug(ind_tickets)

    # generate the lines to write to the file 
    logger.debug("Generating individual ticket strings")
    lines_ind_tickets = []
    lines_initial_selected_options = [] 
    for day, tickets in ind_tickets.items():
        lines_ind_tickets += [f"\t{day}: {{ \n"] \
                           + [format_ind_tickets_line(prod) for prod in tickets.values()] \
                           + ["\t\t},\n"]
        
        lines_initial_selected_options += [f"\t{day}: {{ \n"] \
                                        + [f"\t\t{prod['default']['prod_name'].split('-')[-1].strip()}: false,\n" for prod in tickets.values()] \
                                        + ["\t\t},\n"]

    # Get the 'passes' and generate a dict which has the keys of passes prod_id
    # The values of that dict are another dict with keys 'default' and 'student'
    logger.debug("get passes and create empty dict to store details in")
    passes   = [d for d in items if ('Pass' in d['prod_name'])]
    passes_sorted = {d['prod_id']: {'default': None, 'student': None} for d in passes if (d['price_type'] is not None) & (d['product_active'])}

    # Sort the passes by putting the default and student prices into the right places
    logger.debug("Put pass prices into dict")
    for i in passes:
        passes_sorted[i['prod_id']][i['price_type']] = i

    logger.debug(passes_sorted)

    # generate the lines to be written to the file for the passes
    logger.debug("Generate passes strings")
    lines_passes = [format_passes_line(prod, ind_tickets) for prod in passes_sorted.values()]                                        

    # get the location of the Full Pass, if not exist just default to last pass in the list
    try:
        full_pass_loc = next(index for index, pass_ in enumerate(passes_sorted.values()) if pass_['default']['prod_name'] == 'Full Pass')
    except StopIteration:
        full_pass_loc = -1

    # load the template
    logger.debug("load template and substitute")
    with open("./pricingDefaults.template", 'r') as file:
        tmpl_f = Template(file.read())
    new_file = tmpl_f.substitute(generate_info='', 
                        individual_tickets=''.join(lines_ind_tickets), 
                        lines_initial_selected_options=''.join(lines_initial_selected_options), 
                        passes=''.join(lines_passes),
                        days=days,
                        full_pass_loc=full_pass_loc)
    # with open("./pricingDefaults.test.ts", 'w') as file:     
    #     file.write(new_file)    

    logger.debug("get repo")
    repo = git.get_repo("bardsley/merseysidelatinfestival")

    dt_string = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
    message = "Update prices "+dt_string
    path = "components/ticketing/pricingDefaultsDynamic.ts"
    branch = "pricing-dev"
    author = InputGitAuthor(
        "connorkm2",
        "connor1monaghan@gmail.com"
        )

    logger.info(f"Creating commit to {branch}")
    try:
        contents = repo.get_contents(path, branch)
        repo.update_file(contents.path, message, new_file, contents.sha, branch=branch, author=author)
    except :
        logger.info("File not found, creating it")
        repo.create_file(path, message, new_file, branch=branch, author=author)

    logger.info("merge")
    try:
        response = repo.merge("develop", branch, commit_message=message)
        logger.info(response)
    except Github.GithubException as ge:
        logger.error(ge) 