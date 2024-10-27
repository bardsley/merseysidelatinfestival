import json

## ENV
attendees_table_name = os.environ.get("ATTENDEES_TABLE_NAME")

def lambda_handler(event, context):
    # TODO implement
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
