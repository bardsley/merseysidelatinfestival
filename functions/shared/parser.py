import json
import logging

logger = logging.getLogger()
logger.setLevel("INFO")

def parse_event(event):
    '''
    Parses the input event and ensures it is returned as a dictionary.
    '''
    try:
        # Check if event is a dictionary with a 'body' (HTTP request case)
        if isinstance(event, dict) and 'body' in event:
            logger.info("Parsing event from HTTP POST request body")
            
            # Store the requestContext if it exists
            request_context = event.get('requestContext')

            try:
                # Attempt to parse the body as JSON
                event_body = json.loads(event['body'])
            except json.JSONDecodeError:
                logger.warning("Failed to parse event['body'] as JSON. Checking if it is already a dictionary.")
                # Check if the body is already a dictionary
                if isinstance(event['body'], dict):
                    event_body = event['body']
                else:
                    logger.error("event['body'] is neither valid JSON nor a dictionary")
                    raise ValueError("Invalid event body format. Must be JSON string or dictionary.")

            # Use the parsed or existing dictionary body
            event = event_body

            # Add requestContext back into the event if it exists
            if request_context:
                event['requestContext'] = request_context

        # Check if event is a JSON string
        elif isinstance(event, str):
            logger.info("Parsing event from JSON string")
            event = json.loads(event)

        # Validate that the event is now a dictionary
        if not isinstance(event, dict):
            logger.error("Event is not a dictionary after parsing")
            raise TypeError("Event must be a dictionary or a valid JSON string")

    except (json.JSONDecodeError, TypeError) as e:
        logger.error("Event parsing error: %s", str(e))
        raise ValueError("Invalid event format or JSON structure")

    return event


def validate_event(event, required_fields):
    '''
    Validates that the necessary fields are present in the event.
    '''
    missing_fields = [field for field in required_fields if field not in event]

    if missing_fields:
        logger.error("Missing required fields: %s", missing_fields)
        raise KeyError(f"Missing required fields: {missing_fields}")

    return event

def validate_line_item(line_item):
    '''
    Validates the line_item structure to ensure it includes at least amount_total and description
    '''
    if not isinstance(line_item, dict):
        raise ValueError("Line item must be a dictionary.")
    if 'amount_total' not in line_item or 'description' not in line_item:
        raise ValueError("Line item must include 'amount_total' and 'description'.")

def validate_line_items(line_items):
    '''
    Validates each line item in the line_items list
    '''
    if not isinstance(line_items, list):
        raise ValueError("Line items must be a list.")
    for item in line_items:
        validate_line_item(item)