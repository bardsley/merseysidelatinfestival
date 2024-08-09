import boto3
from boto3.dynamodb.conditions import Key, Attr
import json
import os
import logging
from json.decoder import JSONDecodeError
logger = logging.getLogger()
logger.setLevel("INFO")

# #* This is not required for deployment only needed for local testing 
# logging.basicConfig()
# profile_name='AdministratorAccess-645491919786'
# boto3.setup_default_session(profile_name=profile_name)

db = boto3.resource('dynamodb')
table = db.Table('dev-mlf24_attendees')

def get_ticket(ticket_number):
    '''

    '''
    response = table.query(IndexName='ticket_number-index',KeyConditionExpression=Key('ticket_number').eq(ticket_number))
    if response['Count'] == 0: 
        raise ValueError("Ticket not found")
    elif response['Count'] > 1:
        logger.warning("More than one db entry has been found when only one is expected.")
        raise ValueError("An internal error has occured.")
    else:
        return response['Items'][0]

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

    '''
    # get data and check if it is proper JSON return error if not
    try:
        data = json.loads(event['body'])
        logger.info(data)
    except (TypeError, JSONDecodeError) as e:
        logger.error(e)
        return err("An error has occured with the input you have provided.", event_body=event['body'])
    
#     # get the ticket entry from db send error is not exist or not match
#     # used to check meal option is included and raise error if it is being set and not part of ticket
#     #? when setting meal options could access be sent with the request from client to save ddb call?
    
#     # check that one or both options are set which is required to proceed return error if not
#     if ('preferences' not in data) and ('schedule' not in data):
#         return err("Must provide one or both of (preferences, schedule). ")

#     # check that ticket number and email are both set return error if not
    if ('ticket_number' not in data) and ('email' not in data) and ('check_in_at' not in data):
        return err("Must provide ticket_number and email and a scan in timestamp.")
    else:
        ticket_number = data['ticket_number'] # Ticket numerbs are strings now
        email = data['email']
        check_in_at = data['check_in_at']
    
#     try:
#         ticket_entry = get_ticket(ticket_number, email)
#     except ValueError as e:
#         logger.error(f"GET TICKET FAILED:, {ticket_number} : {email}")
#         return err(str(e))
        
#     # empty variables to be set according to what options are slected (meal_options, schedule)
#     UpdateExp   = ""
#     ExpAttrVals = {}

#     # append to the ddb update expression the options which are selected and set the values 
#     # (meal_options, schedule) are both formatted as JSON
#     if 'preferences' in data:
#         # return an error if the meal option is not included in this ticket
#         if ticket_entry['access'][2] < 1: return err("Attempting to set meal options for a ticket which does not include dinner.")

#         logger.info(f"-SET MEAL OPTIONS:, {data['preferences']}")
#         UpdateExp += ", meal_preferences = :val1"
#         ExpAttrVals[':val1'] = data['preferences']
#     if 'schedule' in data:
#         logger.info(f"-SET SCHEDULE OPTIONS:, {data['schedule']}")
#         UpdateExp += ", schedule = :val2"
#         ExpAttrVals[':val2'] = json.dumps(data['schedule'])    
#     # define the params for the ddb update
    params = {
        'Key': {
            'email':email,
            'ticket_number':ticket_number
        },
        'ConditionExpression':'attribute_exists(ticket_number)',
        'UpdateExpression':'SET ticket_used = :val1',
        'ExpressionAttributeValues' : {
            ':val1': check_in_at
        }
    }

#     # try to update db
#     # if email or ticket number do not exist or do not match then return an error 
    try:
        logger.info(params)
        response = table.update_item(**params)
        return {'statusCode': 200, 'body': json.dumps({'message':"Ticket Scanned"})}
    except db.meta.client.exceptions.ConditionalCheckFailedException as e:
        logger.error(e)
        return err("Ticket number does not exist or match email.")


def get(event):
    '''

    '''
    # get data and check that stuff exists
    data = event['queryStringParameters'] 
    if ('ticket_number' not in data):
        logger.error("ticket_number not set")
        return err("Must provide ticket_number.")
    else:
        if data['ticket_number'].isnumeric() is False: return err("ticket number not int-like")
        ticket_number = data['ticket_number']

    # query db for ticket number and email, if don't match or exist return error
    # return internal server error if there is more than one response item as something must have gone wrong
    try:
        ticket_entry = get_ticket(ticket_number)
    except ValueError as e:
        return err(str(e))

    return {
            'statusCode': 200,
            'body': ticket_entry
        }

def lambda_handler(event, context):
    '''

    '''    
    logger.info('## NEW REQUEST')
    if event['requestContext']['http']['method'] == 'POST':
        return post(event)
    elif event['requestContext']['http']['method'] == 'GET':
        return get(event)
    else:
        return {
            'statusCode': 405,
            'body': "Method Not Allowed"
        }  