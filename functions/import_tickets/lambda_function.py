import json
import os
import time
import logging
from datetime import datetime
from random import randint
import re

import boto3
from boto3.dynamodb.conditions import Key
from shared.DecimalEncoder import DecimalEncoder
from shared.parser import parse_event, validate_event

# ENV
attendees_table_name = os.environ.get("ATTENDEES_TABLE_NAME")
send_email_lambda    = os.environ.get("SEND_EMAIL_LAMBDA")
event_table_name     = os.environ.get("EVENT_TABLE_NAME")

logger = logging.getLogger()
logger.setLevel(logging.INFO)

db = boto3.resource('dynamodb')
attendees_table = db.Table(attendees_table_name)
event_table = db.Table(event_table_name)
lambda_client = boto3.client('lambda')

def err(msg:str, code=400, logmsg=None, **kwargs):
    logmsg = logmsg if logmsg else msg
    logger.error(logmsg)
    for k in kwargs:
        logger.error(k+":"+kwargs[k])
    return {
        'statusCode': code, 
        'body': json.dumps({'error': msg})
        }

def send_email(name, email, ticket_number, line_items, meal_upgrade, meal_upgrade_base_link, pass_type, give_discount, discount_code=""):
    logger.info(os.environ.get("SEND_EMAIL_LAMBDA"))
    # send the email with these details
    logger.info("Invoking send_email lambda")
    prefill_code = "&prefilled_promo_code={}".format(discount_code) if give_discount else ""
    response = lambda_client.invoke(
        FunctionName=os.environ.get("SEND_EMAIL_LAMBDA"),
        InvocationType='Event',
        Payload=json.dumps({
                'email_type':"standard_ticket" if not meal_upgrade else "meal_upgrade_ticket",
                'name':name, 
                'email':email, 
                'ticket_number': ticket_number,
                'line_items':line_items,
                'heading_message': "YOUR PASS FOR MLF24" if "Artist Pass" not in pass_type else "YOUR ARTIST PASS FOR MLF24", 
                'meal_link':meal_upgrade_base_link+"?client_reference_id={}{}".format(ticket_number, prefill_code)
            }, cls=DecimalEncoder),
        )
    logger.info(response)

def get_line_items(passes, amount_total):
    return [{"amount_total": amount_total, "description": i,"price_id": "","prod_id": ""} for i in passes]

def get_ticket_number(email, student_ticket):
    search = True
    # generate a new ticket number if it is already used in the table
    while search:
        ticketnumber = str(randint(1000000000, 9999999999)) if student_ticket == False else str(55)+str(randint(1000000000, 9999999999))[:-2]
        response = attendees_table.query(KeyConditionExpression=Key('ticket_number').eq(ticketnumber) & Key('email').eq(email))
        if response['Count'] == 0:
            search = False
    logger.info("ticket number generated: "+str(ticketnumber))
    return ticketnumber

def match_passes(imported_pass):
    available_pass_types = {
        "Full Pass":   [1,1,1,1,1,1],
        "Artist Pass": [1,1,1,1,1,1],
        "Staff Pass":  [1,1,1,1,1,1],
        "Full Pass (without dinner)":       [1,1,0,1,1,1],
        "Volunteer Pass (without dinner)":  [1,1,0,1,1,1],
        "Artist Pass (without dinner)":     [1,1,0,1,1,1],
        "Saturday Pass (without dinner)":   [0,1,0,1,0,0],
        "Party Pass":    [1,0,0,1,0,1],
        "Saturday Pass": [0,1,1,1,0,0],
        "Sunday Pass":   [0,0,0,0,1,1],
        "Class Pass":    [0,1,0,0,1,0],
        "Saturday - Party":  [0,0,0,1,0,0],
        "Saturday - Class":  [0,1,0,0,0,0],
        "Saturday - Dinner": [0,0,1,0,0,0],
        "Friday - Party":    [1,0,0,0,0,0],
        "Sunday - Party":    [0,0,0,0,0,1],
        "Sunday - Class":    [0,0,0,0,1,0],
    }
    # imported_pass = re.sub(r'\(.*?\)|student', '', imported_pass, flags=re.IGNORECASE).strip().lower()

    # Find the closest match in the available pass types
    for pass_type in available_pass_types:
        if imported_pass.strip().lower() == pass_type.strip().lower():
            return pass_type, available_pass_types[pass_type]

    logger.warning(f"No exact match found for imported pass: {imported_pass}")
    return "unknown", [0, 0, 0, 0, 0, 0]


def lambda_handler(event, context):
    try:
        event = parse_event(event)
        event = validate_event(event, ['attendees', 'options'])
        logger.info(event)
    except (ValueError, TypeError, KeyError) as e:
        logger.error("Event validation failed: %s", str(e))
        logger.error(event)
        return {
            'statusCode': 400,
            'body': f'Invalid input: {str(e)}'
        }

    attendees = event['attendees']
    options   = event['options']
    meal_upgrade_base_link = ''

    failed_imports = []

    if options.get('sendMealUpgrade', False):
        response = event_table.scan(FilterExpression=Key('PK').eq("UPGRADE#VOLUNTEER"))
        sorted_list = sorted(response['Items'], key=lambda item: item.get('timestamp', time.time())) if len(response['Items']) > 0 else None

        meal_upgrade_base_link = sorted_list[0].get('payment_link', '')

    for attendee in attendees:
        try:
            if not attendee.get('email') or not attendee.get('name') or not attendee.get('passes'):
                raise ValueError("Missing required fields: passes, email, or name.")

            ticket_number = str(attendee['ticket_number']) if attendee['ticket_number'] is not None else str(get_ticket_number(attendee['email'], attendee['student_ticket']))

            purchased_at = attendee.get('purchased_at')
            if purchased_at:
                try:
                    if isinstance(purchased_at, str):
                        if purchased_at.isdigit():
                            purchased_at = int(purchased_at)
                        else:
                            purchased_at = int(time.mktime(datetime.strptime(purchased_at, '%Y-%m-%dT%H:%M:%S.000Z').timetuple()))
                    elif isinstance(purchased_at, (int, float)):
                        purchased_at = int(purchased_at)
                except (ValueError, TypeError):
                    raise ValueError("Invalid purchase date format.")
            else:
                purchased_at = int(time.time())
            
            pass_type, access_array = match_passes(attendee['passes'][0]) if 'passes' in attendee and attendee['passes'] else (None, [0, 0, 0, 0, 0, 0])

            line_items = get_line_items(attendee['passes'], attendee['unit_amount'])
            input = {
                'ticket_number': ticket_number,
                'email': attendee['email'],      
                'full_name':attendee['name'],
                'phone': str(attendee['phone']) if 'phone' in attendee else None,
                'active': True,
                'purchase_date':purchased_at,
                'line_items': get_line_items(attendee['passes'], attendee['unit_amount']),
                'access':access_array,
                'ticket_used': False,
                'status': attendee.get('status', 'import'),
                'student_ticket': attendee.get('student_ticket', False),
                'schedule': None,
                'checkout_session': attendee.get('cs_id'),
                'meal_preferences': None,
                'promo_code': None,
                'history': None,
            }

            input = {k: v for k, v in input.items() if v is not None}

            respone = attendees_table.put_item(Item=input)
            send_meal_upgrade = True if options.get('sendMealUpgrade', False) and access_array[2] == 0 else False

            if (options['sendTicketEmails'] == "everyone") or (options['sendTicketEmails'] == "new" and not str(attendee['ticket_number'])) or (options.get('sendMealUpgrade', False)):
                discount = options.get('giveDiscount', False)
                code = options.get('discountCode', "")
                send_email(attendee['name'], attendee['email'], ticket_number, line_items, send_meal_upgrade, meal_upgrade_base_link, pass_type, discount, code)
    
        except (ValueError, KeyError, boto3.exceptions.Boto3Error) as e:
            logger.error(f"Failed to process attendee: {attendee}")
            logger.error(f"Error: {str(e)}")
            failed_imports.append({
                'attendee': attendee,
                'error': str(e)
            })
            
    response_body = {
        'message': 'Attendees import completed with partial success' if failed_imports else 'All attendees imported successfully',
        'failed_imports': failed_imports
    }

    return {
        'statusCode': 207 if failed_imports else 200,
        'body': json.dumps(response_body)
    }
