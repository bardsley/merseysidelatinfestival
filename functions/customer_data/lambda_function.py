import boto3
from boto3.dynamodb.conditions import Key, Attr
import json
import os
import logging
from json.decoder import JSONDecodeError
logger = logging.getLogger()
logger.setLevel("INFO")

#* This is not required for deployment only needed for local testing 
logging.basicConfig()
profile_name='AdministratorAccess-645491919786'
boto3.setup_default_session(profile_name=profile_name)

db = boto3.resource('dynamodb')
table = db.Table('mlf24_db')

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
    #TODO check that the tiket number includes meal access
    '''
    # get data and check if it is proper JSON return error if not
    try:
        data = json.loads(event['body'])
    except (TypeError, JSONDecodeError) as e:
        logger.error(e)
        return err("An error has occured with the input you have provied.", event_body=event['body'])
    
    # get the ticket entry from db send error is not exist or not match
    # used to check meal option is included and raise error if it is being set and not part of ticket
    #? when setting meal options could access be sent with the request from client to save ddb call?
    try:
        ticket_entry = get_ticket(ticket_number, email)
    except ValueError as e:
        return err(e)
    
    # check that one or both options are set which is required to proceed return error if not
    if ('meal_options' not in data) or ('schedule' not in data):
        return err("Must provide one or both of (meal_options, schedule).")

    # check that ticket number and email are both set return error if not
    if ('ticket_number' not in data) and ('email' not in data):
        return err("Must provide ticket_number and email.")
    else:
        ticket_number = int(data['ticket_number'])
        email = data['email']
    
    # empty variables to be set according to what options are slected (meal_options, schedule)
    UpdateExp   = ""
    ExpAttrVals = {}

    # append to the ddb update expression the options which are selected and set the values 
    # (meal_options, schedule) are both formatted as JSON
    if 'meal_options' in data:
        # return an error if the meal option is not included in this ticket
        if ticket_entry['access'][2] < 1: return err("Attempting to set meal options for a ticket which does not include dinner.")

        logger.info(f"-SET MEAL OPTIONS:, {data['meal_options']}")
        UpdateExp += ", meal_options = :val1"
        ExpAttrVals[':val1'] = json.dumps(data['meal_options'])
    if 'schedule' in data:
        logger.info(f"-SET SCHEDULE OPTIONS:, {data['schedule']}")
        UpdateExp += ", schedule = :val2"
        ExpAttrVals[':val2'] = json.dumps(data['schedule'])    
    
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
    if ('ticketnumber' not in data) and ('email' not in data):
        logger.error("ticketnumber and email not set")
        return err("Must provide ticketnumber and email.")
    else:
        if data['ticketnumber'].isnumeric() is False: return err("ticket number not int-like")
        ticket_number = int(data['ticketnumber'])
        email = data['email']

    # query db for ticket number and email, if don't match or exist return error
    # return internal server error if there is more than one response item as something must have gone wrong
    try:
        ticket_entry = get_ticket(ticket_number, email)
    except ValueError as e:
        return err(e)

    response_items = []
    if 'meal' in event['queryStringParameters']['requested']:
        # check that the meal is included in this ticket, if not return error
        if ticket_entry['access'][2] < 1: return err("Attempting to get meal options for a ticket which does not include dinner.")
        
        response_items.append({'meal_options':ticket_entry['meal_options']})
    if 'schedule' in event['queryStringParameters']['requested']:
        response_items.append({'schedule_options':ticket_entry['schedule']})
    return {
            'statusCode': 200,
            'body': response_items
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