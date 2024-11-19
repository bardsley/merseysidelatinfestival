import boto3
from boto3.dynamodb.conditions import Key, Attr
import json
import os
import logging
from json.decoder import JSONDecodeError
from decimal import Decimal
from shared import DecimalEncoder as shared
import time

logger = logging.getLogger()
logger.setLevel("INFO")

# #* This is not required for deployment only needed for local testing 
# logging.basicConfig()
# profile_name='AdministratorAccess-645491919786'
# boto3.setup_default_session(profile_name=profile_name)

lambda_client = boto3.client('lambda')

db = boto3.resource('dynamodb')
table = db.Table(os.environ.get("ATTENDEES_TABLE_NAME"))

def get_ticket(ticket_number, email):
    '''

    '''
    response = table.query(KeyConditionExpression=Key('ticket_number').eq(ticket_number) & Key('email').eq(email))
    if response['Count'] == 0: 
        raise ValueError("Ticket number does not exist or match email.")
    elif response['Count'] > 1:
        logger.warning("More than one db entry has been found when only one is expected.")
        raise ValueError("An internal error has occured.")
    else:
        return response['Items'][0]

def update_group(new_ticket_number, new_email, new_group_id, new_name, old_ticket_number, old_email, old_group_id, old_name, recs):
    logger.info("Invoking group lambda")
    response = lambda_client.invoke(
        FunctionName=os.environ.get("ATTENDEE_GROUPS_LAMBDA"),
        InvocationType='Event',
        Payload=json.dumps({
                'requestContext':{'http': {'method': "PATCH"}},
                'body':json.dumps({
                    'new':{'ticket_number': new_ticket_number, 'group_id': new_group_id, 'email':new_email, 'full_name':new_name}, 
                    'old':{'ticket_number': old_ticket_number, 'group_id': old_group_id, 'email':old_email, 'full_name':old_name}, 
                    'recs': recs,
                })
            }, cls=shared.DecimalEncoder),
        )
    logger.info(response)    

def err(msg:str, code=400, logmsg=None, **kwargs):
    logmsg = logmsg if logmsg else msg
    logger.error(logmsg)
    for k in kwargs:
        logger.error(k+":"+kwargs[k])
    return {
        'statusCode': code, 
        'body': json.dumps({'error': msg})
        }

def post(event):
    '''

    #TODO check the format of meal_options/schedule are correct
    '''
    # get data and check if it is proper JSON return error if not
    try:
        data = json.loads(event['body'])
        logger.info(data)
    except (TypeError, JSONDecodeError) as e:
        logger.error(e)
        return err("An error has occured with the input you have provied.", event_body=event['body'])
    
    # get the ticket entry from db send error is not exist or not match
    # used to check meal option is included and raise error if it is being set and not part of ticket
    #? when setting meal options could access be sent with the request from client to save ddb call?
    
    # check that one or both options are set which is required to proceed return error if not
    if ('preferences' not in data) and ('schedule' not in data):
        return err("Must provide one or both of (preferences, schedule). ")

    # check that ticket number and email are both set return error if not
    if ('ticket_number' not in data) and ('email' not in data):
        return err("Must provide ticket_number and email.")
    else:
        ticket_number = data['ticket_number'] # Ticket numerbs are strings now
        email = data['email']
    
    try:
        ticket_entry = get_ticket(ticket_number, email)
    except ValueError as e:
        logger.error(f"GET TICKET FAILED:, {ticket_number} : {email}")
        return err(str(e))
        
    # empty variables to be set according to what options are slected (meal_options, schedule)
    UpdateExp   = ""
    ExpAttrVals = {}

    # append to the ddb update expression the options which are selected and set the values 
    # (meal_options, schedule) are both formatted as JSON
    if 'preferences' in data:
        # return an error if the meal option is not included in this ticket
        if ticket_entry['access'][2] < 1: return err("Attempting to set meal options for a ticket which does not include dinner.")

        logger.info(f"-SET MEAL OPTIONS:, {data['preferences']}")
        UpdateExp += ", meal_preferences = :val1"
        ExpAttrVals[':val1'] = data['preferences']
    if 'schedule' in data:
        logger.info(f"-SET SCHEDULE OPTIONS:, {data['schedule']}")
        UpdateExp += ", schedule = :val2"
        ExpAttrVals[':val2'] = json.dumps(data['schedule']) 
    if ('group' in data) & (data['group']['id'] != ''):
        logger.info(f"-SET GROUP OPTIONS:, {data['group']}")
        recs = data['group']['recommendations'] if 'recommendations' in data['group'] else None
        new_group = data['group']['id']
        if ('meal_preferences' not in ticket_entry) or (ticket_entry['meal_preferences'] is None or not ticket_entry['meal_preferences']['seating_preference'] ):
            logger.info("Invoking group lambda")
            response = lambda_client.invoke(
                    FunctionName=os.environ.get("ATTENDEE_GROUPS_LAMBDA"),
                    InvocationType='Event',
                    Payload=json.dumps({
                            'requestContext':{'http': {'method': "POST"}},
                            'body':json.dumps({
                                'ticket_number': ticket_number, 
                                'group_id': data['group']['id'], 
                                'email':email, 
                                'full_name':ticket_entry['full_name'], 
                                'recs': recs,
                                'timestamp':time.time()
                            })
                        }, cls=shared.DecimalEncoder),
                    )
            logger.info(response)   
        elif ('meal_preferences' in ticket_entry):
            if ticket_entry['meal_preferences']['seating_preference'][0] != data['group']['id']:
                update_group(ticket_number, email, data['group']['id'], ticket_entry['full_name'], ticket_number, email, ticket_entry['meal_preferences']['seating_preference'][0], ticket_entry['full_name'], recs)

    # define the params for the ddb update
    params = {
        'Key': {
            'email':email,
            'ticket_number':ticket_number
        },
        'ConditionExpression':'attribute_exists(ticket_number)',
        'UpdateExpression':'SET '+UpdateExp[2:],
        'ExpressionAttributeValues' : ExpAttrVals
    }

    # try to update db
    # if email or ticket number do not exist or do not match then return an error 
    try:
        logger.info(params)
        response = table.update_item(**params)
        return {'statusCode': 200, 'body': json.dumps({'message':"Preferences Updated"})}
    except db.meta.client.exceptions.ConditionalCheckFailedException as e:
        logger.error(e)
        return err("Ticket number does not exist or match email.")


def get(event):
    '''

    '''
    # get data and check that stuff exists
    data = event['queryStringParameters'] 
    logger.info(data)
    if ('ticketnumber' not in data) and ('email' not in data):
        logger.error("ticketnumber and email not set")
        return err("Must provide ticketnumber and email.")
    else:
        if data['ticketnumber'].isnumeric() is False: return err("ticket number not int-like")
        ticket_number = data['ticketnumber']
        email = data['email']

    # query db for ticket number and email, if don't match or exist return error
    # return internal server error if there is more than one response item as something must have gone wrong
    try:
        ticket_entry = get_ticket(ticket_number, email)
    except ValueError as e:
        logger.error(f"GET TICKET FAILED:, {ticket_number} : {email} - {e}")
        return err(str(e))

    response_items = []
    if 'preferences' in event['queryStringParameters']['requested']:
        # check that the meal is included in this ticket, if not return error
        if ticket_entry['access'][2] < 1: 
            return err("Attempting to get meal options for a ticket which does not include dinner.")
        response_items.append({'preferences':ticket_entry.get('meal_preferences', None)})
    if 'schedule' in event['queryStringParameters']['requested']:
        response_items.append({'schedule_options':ticket_entry['schedule']})
    if 'validity' in event['queryStringParameters']['requested']:
        response_items.append({'validity': True})
    if 'info' in event['queryStringParameters']['requested']:
        response_items.append(ticket_entry)

    logger.info(f"Response Items: {response_items}")

    return {
            'statusCode': 200,
            'body': json.dumps(response_items,cls=shared.DecimalEncoder)
        }

def lambda_handler(event, context):
    '''

    '''    
    logger.info('## NEW REQUEST')
    if event['requestContext']['http']['method'] == 'POST':
        logger.info('## POST')
        return post(event)
    elif event['requestContext']['http']['method'] == 'GET':
        logger.info('## GET')
        return get(event)
    else:
        logger.info('## Erm....')
        return {
            'statusCode': 405,
            'body': "Method Not Allowed"
        }  