import random
import math
from copy import deepcopy
import logging
import os
import json
import time

import boto3
from boto3.dynamodb.conditions import Key, Attr
from shared.parser import parse_event, validate_event
from shared.DecimalEncoder import DecimalEncoder

# ENV
attendees_table_name = os.environ.get("ATTENDEES_TABLE_NAME")
event_table_name = os.environ.get("EVENT_TABLE_NAME")

logger = logging.getLogger()
logger.setLevel("INFO")

db = boto3.resource('dynamodb')
attendees_table = db.Table(attendees_table_name)
event_table = db.Table(event_table_name)

def get_output_string(seating):
    output_str = ""
    for i, table in enumerate(seating):
        output_str += f"Table {i + 1}:\n"
        for attendee in table:
            output_str += f"  - {attendee['full_name']:<30} {str(attendee['group']):<25} (Ticket: {attendee['ticket_number']}, Fixed: {attendee['fixed']})\n"
        output_str += "\n"
    return output_str

def get_dinner_pass_names():
    return ["2025 Full Pass (with dinner)", "2025 Artist Pass", "2025 Volunteer Pass", "2025 Gala Dinner","Dine and Dance Pass 2025"]

def extract_pass_type(line_items):
    pass_names = get_dinner_pass_names()
    if len(line_items) == 1:
        return line_items[0]['description']
    else:
        for item in line_items:
            if item['description'] in pass_names:
                return item['description']
    return "unknown"

def remove_empty_tables_and_reindex(tables):
    '''
    remove empty tables and reindex
    '''
    non_empty_tables = [table for table in tables if len(table) > 0]
    for new_index, table in enumerate(non_empty_tables):
        for attendee in table:
            attendee['table_number'] = new_index
    return non_empty_tables

def generate_initial_state(attendees, fixed_tickets, table_capacities, min_table_capacity=10, max_table_capacity=12):
    '''
    Generate initial state with groups sat together
    '''
    provided_table_capacities = table_capacities is not None and len(table_capacities) > 0
    allow_capacity_adjustment = not provided_table_capacities

    tables = [[] for _ in table_capacities]
    unassigned_attendees = []
    table_remaining_space = {i: table_capacities[i] for i in range(len(table_capacities))}
    default_table_capacity = min_table_capacity  # Default capacity for new tables

    fixed_ticket_numbers = set(fixed_tickets.keys())

    fixed_attendees = [attendee for attendee in attendees if attendee['ticket_number'] in fixed_ticket_numbers]
    unfixed_attendees = [attendee for attendee in attendees if attendee['ticket_number'] not in fixed_ticket_numbers]

    # assign fixed tickets to tables
    for attendee in fixed_attendees:
        fixed_table_number = fixed_tickets[attendee['ticket_number']]
        if table_remaining_space.get(fixed_table_number, 0) > 0:
            tables[fixed_table_number].append(attendee)
            attendee['table_number'] = fixed_table_number
            attendee['fixed'] = True
            table_remaining_space[fixed_table_number] -= 1
        else:
            logger.warning(f"Table {fixed_table_number + 1} is already full; attendee {attendee['full_name']} could not be placed.")

    # Process unfixed attendees
    for attendee in unfixed_attendees:
        attendee['fixed'] = False
        unassigned_attendees.append(attendee)

    # sort by group
    groups = {}
    for attendee in unassigned_attendees:
        group = attendee['group']
        if group:
            if group not in groups:
                groups[group] = []
            groups[group].append(attendee)
        else:
            groups[None] = groups.get(None, []) + [attendee]

    # place groups on tables
    for group, members in groups.items():
        if group is None:
            continue

        placed = False
        for table_index, table in enumerate(tables):
            if table_remaining_space.get(table_index, 0) >= len(members):
                for member in members:
                    member['table_number'] = table_index
                table.extend(members)
                table_remaining_space[table_index] -= len(members)
                placed = True
                break

        # split large groups or add new tables if needed
        if not placed:
            while members:
                for table_index, table in enumerate(tables):
                    if table_remaining_space.get(table_index, 0) > 0:
                        remaining_space = table_remaining_space[table_index]
                        for member in members[:remaining_space]:
                            member['table_number'] = table_index
                        table.extend(members[:remaining_space])
                        table_remaining_space[table_index] -= remaining_space
                        members = members[remaining_space:]
                        if not members:
                            break
                else:
                    new_table_index = len(tables)
                    tables.append([])
                    if allow_capacity_adjustment:
                        table_remaining_space[new_table_index] = max_table_capacity
                    else:
                        table_remaining_space[new_table_index] = default_table_capacity

                    for member in members[:table_remaining_space[new_table_index]]:
                        member['table_number'] = new_table_index
                    tables[-1].extend(members[:table_remaining_space[new_table_index]])
                    members = members[table_remaining_space[new_table_index]:]

    # Place remaining ungrouped attendees
    if None in groups:
        ungrouped_attendees = groups[None]
        for attendee in ungrouped_attendees:
            for table_index, table in enumerate(tables):
                if table_remaining_space.get(table_index, 0) > 0:
                    attendee['table_number'] = table_index
                    table.append(attendee)
                    table_remaining_space[table_index] -= 1
                    break
            else:
                new_table_index = len(tables)
                tables.append([attendee])
                if allow_capacity_adjustment:
                    table_remaining_space[new_table_index] = max_table_capacity - 1
                else:
                    table_remaining_space[new_table_index] = default_table_capacity - 1
                attendee['table_number'] = new_table_index

    tables = remove_empty_tables_and_reindex(tables)

    return tables

def evaluate_seating(tables, table_capacities, preferred_capacity=10):
    '''
    Calculate the score of current arrangement
    '''
    provided_table_capacities = table_capacities is not None and len(table_capacities) > 0
    allow_capacity_adjustment = not provided_table_capacities

    score = 0
    for table in tables:
        if len(table) == 1:
            score -= 100  

        if len(table) > preferred_capacity and allow_capacity_adjustment:
            score -= 10 * (len(table) - preferred_capacity)

        names = [attendee['full_name'] for attendee in table]
        surnames = [name.split()[-1] for name in names]
        emails = [attendee['email'] for attendee in table]
        pass_types = [attendee.get('pass_type', 'unknown') for attendee in table]
        
        name_counts = {name: names.count(name) for name in set(names)}
        surname_counts = {surname: surnames.count(surname) for surname in set(surnames)}
        email_counts = {email: emails.count(email) for email in set(emails)}
        pass_type_counts = {ptype: pass_types.count(ptype) for ptype in set(pass_types)}

        for count in name_counts.values():
            if count > 1:
                score += count * 50  

        for count in email_counts.values():
            if count > 1:
                score += count * 50

        for count in surname_counts.values():
            if count > 1:
                score += count * 25

        for ptype, count in pass_type_counts.items():
            if ptype in get_dinner_pass_names() and count > 1:
                score += count * 50

    return score


def simulated_annealing(attendees, fixed_tickets, table_capacities, initial_temp=100000, cooling_rate=0.9, min_temp=1, min_table_capacity=10, max_table_capacity=12, allow_capacity_adjustment=True):
    '''
    Optimise the seating with simulated annealing.
    '''
    provided_table_capacities = table_capacities is not None and len(table_capacities) > 0
    allow_capacity_adjustment = not provided_table_capacities

    current_state = generate_initial_state(attendees, fixed_tickets, table_capacities, min_table_capacity, max_table_capacity)
    current_score = evaluate_seating(current_state, table_capacities)
    best_state = deepcopy(current_state)
    best_score = current_score
    temp = initial_temp
    iteration = 0
    out_str = ""

    while temp > min_temp:
        new_state = deepcopy(current_state)

        # swap attendee or group between table
        table1, table2 = random.sample(new_state, 2)

        if not table1 or not table2:
            continue

        group_or_attendee = random.choice(table1)

        # don't move if assigned to a table
        if group_or_attendee['fixed']:
            continue

        # move together if group
        if group_or_attendee['group']:
            group_members = [p for p in table1 if p['group'] == group_or_attendee['group']]
            if len(table2) + len(group_members) <= max_table_capacity:
                for member in group_members:
                    table1.remove(member)
                    table2.append(member)
                    member['table_number'] = new_state.index(table2)

                if allow_capacity_adjustment and len(table2) > min_table_capacity:
                    table_capacities[new_state.index(table2)] = min(max_table_capacity, len(table2))
        else:
            if len(table2) < max_table_capacity:
                table1.remove(group_or_attendee)
                table2.append(group_or_attendee)
                group_or_attendee['table_number'] = new_state.index(table2)

                if allow_capacity_adjustment and len(table2) > min_table_capacity:
                    table_capacities[new_state.index(table2)] = min(max_table_capacity, len(table2))

        new_score = evaluate_seating(new_state, table_capacities)
        delta_score = new_score - current_score
        out_str += f"{iteration}  |    {new_score}      |    {delta_score}     | \n"
        iteration += 1

        if delta_score > 0 or math.exp(delta_score / temp) > random.random():
            current_state = new_state
            current_score = new_score

            if new_score > best_score:
                best_state = new_state
                best_score = new_score

        # apply cooling
        temp *= cooling_rate

    best_state = remove_empty_tables_and_reindex(best_state)

    return best_state

def post(event):  
    response = attendees_table.scan(FilterExpression=Key('active').eq(True))
    filtered_items = [item for item in response.get('Items', []) if item['access'][2] == 1 and extract_pass_type(item.get('line_items', [])) in get_dinner_pass_names()]

    attendees = []
    fixed_tickets = event.get('fixed_tickets', {})

    for item in filtered_items:
        full_name       = item.get('full_name', 'unknown')
        email           = item.get('email', 'unknown')
        ticket_number   = item.get('ticket_number', 'unknown')
        status          = item.get('status', 'unknown')

        meal_prefs  = item.get('meal_preferences', {}) or {}
        group       = meal_prefs.get('seating_preference')
        choices     = meal_prefs.get('choices', [-1,-1,-1])
        diet        = meal_prefs.get('dietary_requirements', {})

        pass_type   = extract_pass_type(item.get('line_items', []))
        is_selected = all(choice >= 0 for choice in choices)
        not_wanted  = all(choice == -99 for choice in choices)

        if group and isinstance(group, str):
            group = group
        elif group and isinstance(group, list):
            group = group[0]
                 
        attendee = {
            'full_name': full_name,
            'ticket_number': ticket_number,
            'group': group.lower().strip() if group and group else None,
            'fixed': False,
            'email': email,
            'is_artist': True if 'Artist' in pass_type else False,
            'is_gratis': True if 'gratis' in status else False,
            'choices': choices,
            'is_selected': is_selected,
            'not_wanted': not_wanted,
            'dietary_requirements': diet,
        }

        attendees.append(attendee)

    logger.info(f"Total attendees: {len(attendees)}")
    logger.info(f"Fixed tickets provided: {len(fixed_tickets)}")

    if isinstance(event.get('table_capacities'), dict):
        table_capacities = list(event.get('table_capacities').values()) 
    elif isinstance(event.get('table_capacities'), list):
        table_capacities = event.get('table_capacities')
    else:
        table_capacities = [10 for i in range(20)]

    optimised_seating = simulated_annealing(attendees, fixed_tickets, table_capacities)

    output_str = get_output_string(optimised_seating)

    logger.info("Seating optimisation completed.")

    try:
        event_entry = {
            'PK': 'SEATING#OPTIMISED',
            'SK': f"DETAIL#{int(time.time())}",
            'seating_data': json.dumps(optimised_seating, indent=2, cls=DecimalEncoder),
            'timestamp': int(time.time())
        }
        event_table.put_item(Item=event_entry)
        logger.info("Optimised seating added to event table.")
    except boto3.exceptions.Boto3Error as e:
        logger.error("Failed to add optimised seating to event table: %s", str(e))
        return {
            'statusCode': 500,
            'body': 'Failed to save optimised seating to event table.'
        }    

    return {
        'statusCode': 200,
        'body': {
            'output_str': output_str,
            'optimised_seating': optimised_seating
        }
    }

def get(event):
    try:
        response = event_table.query(
            KeyConditionExpression=Key('PK').eq('SEATING#OPTIMISED'),
            ScanIndexForward=False,
            Limit=1
        )

        if response['Items']:
            most_recent_entry = response['Items'][0]
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'seating_data': json.loads(most_recent_entry['seating_data']),
                    'timestamp': most_recent_entry['timestamp']
                }, cls=DecimalEncoder)
            }
        else:
            logger.info("No recent optimised seating found")
            post_response = post(event)
            return {
                'statusCode': 202,
                'body': 'No recent optimised seating found. Generating one. Please check back in 1 minute.'
            }
    except boto3.exceptions.Boto3Error as e:
        logger.error("Failed to retrieve seating from event table: %s", str(e))
        return {
            'statusCode': 500,
            'body': 'Failed to retrieve optimised seating from event table.'
        }

def lambda_handler(event, context):
    try:
        event = parse_event(event)
    except (ValueError, TypeError, KeyError) as e:
        logger.error("Event validation failed: %s", str(e))
        logger.error(event)
        return {
            'statusCode': 400,
            'body': f'Invalid input: {str(e)}'
        }

    logger.info("#### MEAL SEATING ####")
    logger.info("Event received: %s", json.dumps(event, indent=2, cls=DecimalEncoder))

    request_type = event.get('requestContext', {}).get('http', {}).get('method', '').lower().strip()
    if 'get' in request_type:
        logger.info("GET RECEIVED")
        return get(event)
    elif 'post' in request_type:
        return post(event)
    else:
        logger.warning("Invalid request method: %s", request_type)
        return {
            'statusCode': 400,
            'body': f'Invalid request method: {request_type}'
        }
