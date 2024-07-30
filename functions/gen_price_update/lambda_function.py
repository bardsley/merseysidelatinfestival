import time

from string import Template
import stripe
import json
import logging
import boto3
import os
from boto3.dynamodb.conditions import Key, Attr
from datetime import datetime
from github import Auth
from github import Github
from github import InputGitAuthor
logger = logging.getLogger()
logger.setLevel("INFO")

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")
auth = Auth.Token(os.environ.get("GITHUB_TOKEN"))
git = Github(auth=auth)
git.get_user().login

#* This is not required for deployment only needed for local testing 
# profile_name='AdministratorAccess-645491919786'
# boto3.setup_default_session(profile_name=profile_name)
# logging.basicConfig()
# from pprint import pprint

db = boto3.resource('dynamodb')
table = db.Table('mlf24_stripe_products')

def convert_access(access):
    conv = ['Friday Party', 'Saturday Classes', 'Saturday Dinner', 'Saturday Party', 'Sunday Classes', 'Sunday Party']
    comb = [conv[i] for i,l in enumerate(json.loads(access)) if l == 1]
    return comb

def lambda_handler(event, context):
    # Get all products which are active
    # response = table.scan(FilterExpression=Attr('active').eq(True))

    # get all the products
    response = table.scan()
    items = response['Items']    

    # Get the 'passes' and generate a dict which has the keys of passes prod_id
    # The values of that dict are another dict with keys 'default' and 'student'
    logger.info("get passes and create empty dict to store details in")
    passes   = [d for d in items if 'Pass' in d['prod_name']]
    passes_sorted = {key: {'default':None, 'student':None} for key in [d['prod_id'] for d in passes if d['price_type'] != None]}

    # Sort the passes by putting the default and student prices into the right places
    logger.info("Put pass prices into dict")
    for i in passes:
        passes_sorted[i['prod_id']][i['price_type']] = i

    logger.info("Generate pass strings")
    # generate the lines to be written to the file for the passes
    lines_passes = []
    for i,prod in enumerate(passes_sorted):
        prod = passes_sorted[prod] # get the pass

        # If student price not available default to 'default' price
        prod['student'] = prod['student'] if prod['student'] != None else prod['default']

        # lowercase true/false in JS
        prod['default']['active'] = 'true' if prod['default']['active'] else 'false'

        # create the line with those details and append it
        lines_passes.append("\t'{}': {{\n\t\t cost: {},\n\t\t studentCost: {},\n\t\t isAvailable: {},\n\t\t saving: {},\n\t\t studentSaving: {},\n\t\t combination: {},\n\t\t description: \"{}\",\n\t\t priceId: '{}',\n\t\t studentPriceId: '{}'}},\n".format(
            prod['default']['prod_name'], prod['default']['unit_amount']/100, prod['student']['unit_amount']/100, prod['default']['active'], 1, 1, convert_access(prod['default']['access']), prod['default']['description'], prod['default']['price_id'], prod['student']['price_id'] 
        ))

    #! create this array automatically    
    days = ['Friday', 'Saturday', 'Sunday']
    
    # do a similar thing as before but for individual tickets but with a container dict which is each day containg
    # the prod_ids associated with that day. and then the subsequent prices
    logger.info("Create empty dict")
    ind_tickets = {day: {prod_id: {'default':None, 'student':None} for prod_id in [d['prod_id'] for d in items if (day in d['prod_name']) & ('Pass' not in d['prod_name'])]} for day in days}

    # sort the individual tickets
    logger.info("sort tickets")
    for item in [d for d in items if 'Pass' not in d['prod_name']]:
        day_name = item['prod_name'].split('-')[0].strip() # get which day this current ticket belongs to
        ind_tickets[day_name][item['prod_id']][item['price_type']] = item # put the item in the right place

    # generate the lines to write to the file 
    lines_initial_selected_options = [] # list for the intially selected options so it agrees with what tickets are available
    lines_ind_tickets = []
    logger.info("generate ticket strings")
    for day in ind_tickets:
        lines_ind_tickets.append("\t{}: {{ \n".format(day))
        lines_initial_selected_options.append("\t{}: {{ \n".format(day))
        for prod in ind_tickets[day]:
            prod = ind_tickets[day][prod]

            prod['student'] = prod['student'] if prod['student'] != None else prod['default']

            option = prod['default']['prod_name'].split('-')[-1].strip()

            lines_ind_tickets.append("\t\t {}:{{\n\t\t\t cost: {},\n\t\t\t studentCost: {},\n\t\t\t isAvailable: {},\n\t\t\t priceId: '{}',\n\t\t\t studentPriceId: '{}'\n\t\t\t }},\n".format(
                option, prod['default']['unit_amount']/100, prod['student']['unit_amount']/100, "true", prod['default']['price_id'], prod['student']['price_id']
            ))
            lines_initial_selected_options.append("\t\t{}: false,\n".format(option)) # init select always false
        # append closing 
        lines_ind_tickets.append("\t\t},\n")
        lines_initial_selected_options.append("\t\t},\n")

    # get the location of the Full Pass, if not exist just default to last pass in the list
    try:
        full_pass_loc = [passes_sorted[d]['default']['prod_name'] for d in passes_sorted].index('Full Pass')
    except ValueError as e:
        full_pass_loc = -1

    # load the template
    logger.info("load template and substitute")
    with open("./pricingDefaults.template", 'r') as file:
        tmpl_f = Template(file.read())
    new_file = tmpl_f.substitute(generate_info='', 
                        individual_tickets=''.join(lines_ind_tickets), 
                        lines_initial_selected_options=''.join(lines_initial_selected_options), 
                        passes=''.join(lines_passes),
                        days=days,
                        full_pass_loc=full_pass_loc)

    logger.info("get repo")
    repo = git.get_repo("bardsley/merseysidelatinfestival")

    dt_string = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
    message = "Update prices "+dt_string
    path = "components/ticketing/pricingDefaultsDynamic.ts"
    branch = "pricing"
    author = InputGitAuthor(
        "connorkm2",
        "connor1monaghan@gmail.com"
        )

    logger.info("try get the file from repo")
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