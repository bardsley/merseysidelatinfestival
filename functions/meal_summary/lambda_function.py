import json
import logging

import boto3
from boto3.dynamodb.conditions import Key, Attr
from shared import DecimalEncoder
import os

## ENV
attendees_table_name = os.environ.get("ATTENDEES_TABLE_NAME")

logger = logging.getLogger()
logger.setLevel("INFO")

profile_name='danceengine-admin'
boto3.setup_default_session(profile_name=profile_name)
logging.basicConfig()

db = boto3.resource('dynamodb')
table = db.Table(attendees_table_name)

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

    not_selected_count = 0   # All choices are -1 (not selected)
    incomplete_count = 0     # Some choices are -1 (incomplete selection)
    not_wanted_count = 0     # Any choice is -99 (not wanted)
    selected_count = 0       # All choices are >= 0 (options selected)
    
    filtered_items = [item for item in response['Items']if (item['access'][2] == 1)]
    
    #! If no matches should problably return a 404
    for item in filtered_items:
        if 'meal_preferences' not in item:
            not_selected_count += 1
            continue

        meal_prefs = item['meal_preferences']
        if meal_prefs and 'choices' in meal_prefs:
            choices = meal_prefs['choices']

            if all(choice == -1 for choice in choices):
                not_selected_count += 1
            elif any(choice == -1 for choice in choices):
                incomplete_count += 1
            elif any(choice == -99 for choice in choices):
                not_wanted_count += 1
            elif all(choice >= 0 for choice in choices):
                selected_count += 1
                
                for i, choice in enumerate(choices):
                    if choice >= 0 and choice in course_mappings[i]:
                        dish_name = course_mappings[i][choice]
                        if dish_name in course_frequencies[i]:
                            course_frequencies[i][dish_name] += 1
                        else:
                            course_frequencies[i][dish_name] = 1

    logger.info(f"Statistics: Not selected: {not_selected_count}, Incomplete: {incomplete_count}, Not wanted: {not_wanted_count}, Selected: {selected_count}")
    logger.info(f"Course Frequencies: {course_frequencies}")

    return {
        'statusCode': 200,
        'body': json.dumps({
            'statistics': {
                'not_selected_count': not_selected_count,
                'incomplete_count': incomplete_count,
                'not_wanted_count': not_wanted_count,
                'selected_count': selected_count,
                'course_frequencies': course_frequencies
            }}, cls=DecimalEncoder.DecimalEncoder)
    }

from pprint import pprint
pprint(lambda_handler({'requestContext':{'http':{'method':"GET"}}}, None))