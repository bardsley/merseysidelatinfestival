# import boto3

# # #* This is not required for deployment only needed for local testing 
# logging.basicConfig()
# profile_name='AdministratorAccess-645491919786'
# boto3.setup_default_session(profile_name=profile_name)

# lambda_client = boto3.client('lambda')

from lambda_function import lambda_handler

lambda_handler({
    'name':"Connor Monaghan", 
    'email':"connor1monaghan@gmail.com", 
    'ticket_number':123456789, 
    'line_items':{
        'data':[
            {'description':"ITEM 1", 'amount_total':7500},
            {'description':"ITEM 2", 'amount_total':3500},
            {'description':"ITEM 3", 'amount_total':12500}
            ]
    }
    }, None)