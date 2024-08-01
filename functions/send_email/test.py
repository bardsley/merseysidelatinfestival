from lambda_function import lambda_handler
# import boto3

#* This is not required for deployment only needed for local testing 
# logging.basicConfig()
# profile_name='AdministratorAccess-645491919786'
# boto3.setup_default_session(profile_name=profile_name)

event = {
    'email_type':"transfer_ticket",
    'name': 'CK Monaghan', 
    'email': 'c.monaghan@liverpool.ac.uk', 
    'ticket_number': '5520910259', 
    'line_items': [
        {
            'prod_id': 'prod_QQTrga8mShkzyo', 
            'price_id': 'price_1PgTOHEWkmdeWsQPNMogFUVa', 
            'description': 'Party Pass', 
            'amount_total': 3500
        }], 
    'heading_message': 'A TICKET HAS BEEN TRANSFERRED TO YOU!',
    'email_from':"john.doe@example.com",
    'full_name_from':"John Doe"
    }

lambda_handler(event, None)