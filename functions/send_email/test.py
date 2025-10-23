from lambda_function import lambda_handler
# import boto3

#* This is not required for deployment only needed for local testing 
# logging.basicConfig()
# profile_name='AdministratorAccess-645491919786'
# boto3.setup_default_session(profile_name=profile_name)

event = {
    'email_type': 'transfer_ticket', 
    'name': 'T Enzyme', 
    'email': 'toaster_amylase0a@icloud.com', 
    'ticket_number': '7227400839', 
    'line_items': [
        {'price_id': 'price_1PZcrKEWkmdeWsQPl1h22Dk4', 'amount_total': 9500, 'description': 'Saturday Pass', 'prod_id': 'prod_QQToHXWAJ7kCf4'}, 
        {'price_id': 'price_1PZdHNEWkmdeWsQPMx12ez1O', 'amount_total': 1500, 'description': 'Sunday - Party', 'prod_id': 'prod_QQUFAgkOcEFm3I'}
    ], 
    'email_from': 'toaster_amylase0a@icloud.com', 
    'full_name_from': 'C M', 
    'heading_message': 'A TICKET HAS BEEN TRANSFERRED TO YOU!'
}

send_ticket_event = {
    'email_type':"standard_ticket",
    'name': "Elton John", 
    'email': "connor1monaghan@gmail.com", 
    'ticket_number': "7227400839", 
    'line_items':[
        {'price_id': 'price_1PZcrKEWkmdeWsQPl1h22Dk4', 'amount_total': 9500, 'description': 'Saturday Pass', 'prod_id': 'prod_QQToHXWAJ7kCf4'}, 
        {'price_id': 'price_1PZdHNEWkmdeWsQPMx12ez1O', 'amount_total': 1500, 'description': 'Sunday - Party', 'prod_id': 'prod_QQUFAgkOcEFm3I'}
    ],
    'heading_message': "THANK YOU FOR YOUR PURCHASE!"
}

# lambda_handler(send_ticket_event, None)
lambda_handler(event, None)