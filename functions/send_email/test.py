# import boto3

# # #* This is not required for deployment only needed for local testing 
# logging.basicConfig()
# profile_name='AdministratorAccess-645491919786'
# boto3.setup_default_session(profile_name=profile_name)

# lambda_client = boto3.client('lambda')

# from lambda_function import lambda_handler

# lambda_handler({
#     'name':"Connor Monaghan", 
#     'email':"connor1monaghan@gmail.com", 
#     'ticket_number':123456789, 
#     'line_items':{
#         'data':[
#             {'description':"ITEM 1", 'amount_total':7500},
#             {'description':"ITEM 2", 'amount_total':3500},
#             {'description':"ITEM 3", 'amount_total':12500}
#             ]
#     }
#     }, None)

import boto3 
import json

#* This is not required for deployment only needed for local testing 
# logging.basicConfig()
profile_name='AdministratorAccess-645491919786'
boto3.setup_default_session(profile_name=profile_name)

lambda_client = boto3.client('lambda')

event = {
    'name':"C K Monaghan", 
    'email':"connor1monaghan@gmail.com", 
    'ticket_number':7501444444, 
    'line_items':{
        'data':[
            {'description':"ITEM 1", 'amount_total':7500},
            {'description':"ITEM 2", 'amount_total':3500}
            ]
    }
}

response = lambda_client.invoke(
    FunctionName='dev-send_email',
    InvocationType='Event',
    Payload=json.dumps(event),
    # Qualifier='1',
    )

# arn:aws:lambda:eu-west-2:645491919786:function:dev-send_email