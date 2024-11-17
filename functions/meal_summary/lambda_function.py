import json
import logging

import boto3
from boto3.dynamodb.conditions import Key, Attr
from shared import DecimalEncoder
import os

## ENV
attendees_table_name = os.environ.get("ATTENDEES_TABLE_NAME")
event_table_name = os.environ.get("EVENT_TABLE_NAME")

logger = logging.getLogger()
logger.setLevel("INFO")

# profile_name='danceengine-admin'
# boto3.setup_default_session(profile_name=profile_name)
# logging.basicConfig()

db = boto3.resource('dynamodb')
table = db.Table(attendees_table_name)
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

def get_dinner_pass_names():
    return ["Full Pass", "Artist Pass", "Volunteer Pass", "Saturday - Dinner"]

def extract_pass_type(line_items):
    pass_names = get_dinner_pass_names()
    if len(line_items) == 1:
        return line_items[0]['description']
    else:
        for item in line_items:
            if item['description'] in pass_names:
                return item['description']
    return "unknown"

def get_last_email():
    response = event_table.scan(FilterExpression=Key('PK').eq("EMAIL#MEALREMINDER"))
    sorted_list = sorted(response['Items'], key=lambda item: item['timestamp']) if len(response['Items']) > 0 else None

    return sorted_list

def lambda_handler(event, context):
    logger.info(f"Event {event}")
    if event['requestContext']['http']['method'] != "GET": return err("Method not allowed, make GET request", code=405)

    response = table.scan(FilterExpression=Key('active').eq(True))

    course_mappings = [
            {0: "Vegetable Terrine", 1: "Chicken Liver Pate"},
            {0: "Roasted Onion", 1: "Fish and Prawn Risotto", 2: "Chicken Supreme"},
            {0: "Fruit Platter", 1: "Bread and Butter Pudding"}
        ]
    num_courses = 3
    course_frequencies = [{} for _ in range(num_courses)]
    
    dietary_frequencies = {}

    not_selected_count = 0   # All choices are -1 (not selected)
    incomplete_count = 0     # Some choices are -1 (incomplete selection)
    not_wanted_count = 0     # Any choice is -99 (not wanted)
    selected_count = 0       # All choices are >= 0 (options selected)
    group_count = 0
    
    filtered_items = [item for item in response['Items'] if (item['access'][2] == 1)]

    not_wanted_count = len([item for item in response['Items'] if (item['access'][2] == -1)]) # if it has been removed by an admin because they didn't want

    meal_attendees_list = []
    
    #! If no matches should problably return a 404
    for item in filtered_items:
        meal_prefs           = item.get('meal_preferences', {}) or {}
        ticket_number        = item.get('ticket_number', 'unknown')
        full_name            = item.get('full_name', 'unknown')
        choices              = meal_prefs.get('choices', [-1,-1,-1])
        assigned_table       = meal_prefs.get('table', None)
        group                = meal_prefs.get('seating_preference', [None])
        dietary_requirements = meal_prefs.get('dietary_requirements', {})
        is_selected          = all(choice >= 0 for choice in choices)
        not_wanted           = all(choice == -99 for choice in choices)

        pass_type = extract_pass_type(item.get('line_items', []))

        meal_attendees_list.append({
            'ticket_number': ticket_number,
            'full_name': full_name,
            'pass_type': pass_type,
            'choices': choices,
            'dietary_requirements': dietary_requirements,
            'assigned_table': assigned_table,
            'is_selected': is_selected,
            'not_wanted': not_wanted,
            'group': group
        })

        if group is not None and group != "" and group != []:
            group_count += 1        
        
        if not meal_prefs or all(choice == -1 for choice in choices):
            not_selected_count += 1
            continue

        if any(choice == -1 for choice in choices):
            incomplete_count += 1
        elif all(choice == -99 for choice in choices):
            not_wanted_count += 1
        elif all(choice >= 0 for choice in choices):
            selected_count += 1

            dietary_selected = dietary_requirements.get('selected', [])
            for keyword in dietary_selected:
                if keyword in dietary_frequencies:
                    dietary_frequencies[keyword] += 1
                else:
                    dietary_frequencies[keyword] = 1            

            for i, choice in enumerate(choices):
                if choice >= 0 and choice in course_mappings[i]:
                    dish_name = course_mappings[i][choice]
                    if dish_name in course_frequencies[i]:
                        course_frequencies[i][dish_name] += 1
                    else:
                        course_frequencies[i][dish_name] = 1

    logger.info(f"Statistics: Not selected: {not_selected_count}, Incomplete: {incomplete_count}, Not wanted: {not_wanted_count}, Selected: {selected_count}, Total number of attendees with dinner: {len(meal_attendees_list)}")
    logger.info(f"Course Frequencies: {course_frequencies}")
    logger.info(f"Dietary Frequencies: {dietary_frequencies}")

    return {
        'statusCode': 200,
        'body': json.dumps({
            'statistics': {
                'not_selected_count': not_selected_count,
                'incomplete_count': incomplete_count,
                'not_wanted_count': not_wanted_count,
                'selected_count': selected_count,
                'group_count': group_count,
                'course_frequencies': course_frequencies,
                'dietary_frequencies': dietary_frequencies,
            },
            'reminders_sent': get_last_email(),
            'meal_attendees_list': meal_attendees_list,
        }, cls=DecimalEncoder.DecimalEncoder)
    }

# from pprint import pprint
# pprint(lambda_handler({'requestContext':{'http':{'method':"GET"}}}, None))
# lambda_handler({'requestContext':{'http':{'method':"GET"}}}, None)