# Pseudocode:
# if only the name being changed and not email
#   update the name on the ticket
#   send ticket and tell them the name was changed
# if email is being updated
#   create a new ticket with a new ticket number
#   make the old ticket inactive and state that it has been transferred and to who
#   send the new ticket to the new owner and tell them who it came from
#   send email to old owner telling them they transferred it and who to

import time
import json
import logging
from json.decoder import JSONDecodeError

import boto3
from boto3.dynamodb.conditions import Key

logger = logging.getLogger()
logger.setLevel("INFO")

db = boto3.resource('dynamodb')
table = db.Table('mlf24_db')
 
def err(msg:str, code=400, logmsg=None, **kwargs):
    logmsg = logmsg if logmsg else msg
    logger.error(logmsg)
    for k in kwargs:
        logger.error(k+":"+kwargs[k])
    return {
        'statusCode': code, 
        'body': json.dumps({'error': msg})
        }

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
    
def update_table(input, key, condition=None):
    UpdateExp   = ""
    ExpAttrVals = {}
    for k in input:
        UpdateExp += ", {} = :{}".format(k, k)
        ExpAttrVals[":"+format(k)] = input[k]

    params = {
        'Key': key,
        'UpdateExpression':'SET '+UpdateExp[2:],
        'ExpressionAttributeValues' : ExpAttrVals
    }

    if condition: params['ConditionExpression'] = condition

    try:
        logger.info(params)
        response = table.update_item(**params)
        logger.debug(response)
        return True
    except db.meta.client.exceptions.ConditionalCheckFailedException as e:
        logger.error("The ticket does not exist")
        raise ValueError("Ticket number does not exist or match email.")


def lambda_handler(event, context):
    try:
        data = json.loads(event['body'])
        logger.info(data)
    except (TypeError, JSONDecodeError) as e:
        logger.error(e)
        return err("An error has occured with the input you have provied.", event_body=event['body'])
    
    if ('ticket_number' not in data) and ('email' not in data) and ('email_to' not in data) and ('name_to' not in data):
        return err("Must provide ticket_number, email, email_to, name_to.")
    else:
        ticket_number = int(data['ticket_number'])
        email = data['email']

    try:
        ticket_entry = get_ticket(ticket_number, email)
    except ValueError as e:
        return err(str(e))
    
    if not ticket_entry['active']:
        return_string = "The ticket you are attempting to transfer is not valid. "
        return_string += f"It has been transferred to {ticket_entry['transferred']['full_name']}. " if ticket_entry['transferred'] is not None else ""
        return_string += f"It has been refunded. " if "refunded" in ticket_entry['status'] else ""
        return err(return_string)
    
    if data['email'] == data['email_to']:
        input = {
            'full_name': data['name_to'],
            'transferred': {
                'date': int(time.time()),
                'ticket_number': data['ticket_number'],
                'email': data['email'],
                'full_name': ticket_entry['full_name'],
                'source': data['source'] #! check this here rather than on client
            }
        }

        # TODO send email 
        
        update_table(input, {'email': data['email'], 'ticket_number':data['ticket_number']})
        return {'statusCode': 200, 'body': json.dumps({'message':"Still working on it (Connor)"})}
    else:
        #TODO
        return

