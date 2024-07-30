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

def convert_access(access):
    conv = ['Friday Party', 'Saturday Classes', 'Saturday Dinner', 'Saturday Party', 'Sunday Classes', 'Sunday Party']
    return [conv[i] for i,l in enumerate(json.loads(access)) if l == 1]

def format_passes_line(prod):
    return "\t'{}': {{\n\t\t cost: {},\n\t\t studentCost: {},\n\t\t isAvailable: {},\n\t\t saving: {},\n\t\t studentSaving: {},\n\t\t combination: {},\n\t\t description: \"{}\",\n\t\t priceId: '{}',\n\t\t studentPriceId: '{}'}},\n".format(
        prod['default']['prod_name'], 
        prod['default']['unit_amount']/100, 
        prod['student']['unit_amount']/100 if prod['student'] is not None else prod['default']['unit_amount']/100, 
        "true" if prod['default']['active'] else "false", 
        1, 1, 
        convert_access(prod['default']['access']), 
        prod['default']['description'], 
        prod['default']['price_id'], 
        prod['student']['price_id'] if prod['student'] is not None else prod['default']['price_id']
    )

def format_ind_tickets_line(prod):
    option = prod['default']['prod_name'].split('-')[-1].strip()
    return "\t\t {}:{{\n\t\t\t cost: {},\n\t\t\t studentCost: {},\n\t\t\t isAvailable: {},\n\t\t\t priceId: '{}',\n\t\t\t studentPriceId: '{}'\n\t\t\t }},\n".format(
        option, 
        prod['default']['unit_amount']/100, 
        prod['student']['unit_amount']/100 if prod['student'] is not None else prod['default']['unit_amount']/100, 
        "true" if prod['default']['active'] else "false", 
        prod['default']['price_id'], 
        prod['student']['price_id'] if prod['student'] is not None else prod['default']['price_id']
    )

def lambda_handler(event, context):
    # Get all products which are active
    # response = table.scan(FilterExpression=Attr('active').eq(True))

    # get all the products
    response = table.scan()
    items = response['Items']    

    # Get the 'passes' and generate a dict which has the keys of passes prod_id
    # The values of that dict are another dict with keys 'default' and 'student'
    logger.debug("get passes and create empty dict to store details in")
    passes   = [d for d in items if 'Pass' in d['prod_name']]
    passes_sorted = {d['prod_id']: {'default': None, 'student': None} for d in passes if d['price_type'] is not None}

    # Sort the passes by putting the default and student prices into the right places
    logger.debug("Put pass prices into dict")
    for i in passes:
        passes_sorted[i['prod_id']][i['price_type']] = i

    # generate the lines to be written to the file for the passes
    logger.debug("Generate passes strings")
    lines_passes = [format_passes_line(prod) for prod in passes_sorted.values()]

    #! create this array automatically    
    days = ['Friday', 'Saturday', 'Sunday']
    
    # do a similar thing as before but for individual tickets but with a container dict which is each day containg
    # the prod_ids associated with that day. and then the subsequent prices
    logger.debug("Creating empty dict for individual tickets")
    ind_tickets = {day: {prod_id: {'default':None, 'student':None} for prod_id in [d['prod_id'] for d in items if (day in d['prod_name']) & ('Pass' not in d['prod_name'])]} for day in days}

    # sort the individual tickets
    logger.debug("Sorting tickets")
    for item in [d for d in items if 'Pass' not in d['prod_name']]:
        day_name = item['prod_name'].split('-')[0].strip() # get which day this current ticket belongs to
        ind_tickets[day_name][item['prod_id']][item['price_type']] = item # put the item in the right place

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
    branch = "pricing"
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
        response = repo.merge("pricing-testing", "pricing", commit_message=message)
        logger.info(response)
    except Github.GithubException as ge:
        logger.error(ge) 