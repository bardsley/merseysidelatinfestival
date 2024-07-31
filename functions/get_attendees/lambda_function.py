import json
import boto3
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

#* This is not required for deployment only needed for local testing 
# profile_name='AdministratorAccess-645491919786'
# boto3.setup_default_session(profile_name=profile_name)
# logging.basicConfig()

db = boto3.resource('dynamodb')
table = db.Table('mlf24_stripe_products')

def lambda_handler(event, context):
    response = table.scan()
    return {
        'statusCode': 200,
        'body': json.dumps(response)
    }
