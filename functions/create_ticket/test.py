from lambda_function import lambda_handler

event = {
    'email': 'c.monaghan@liverpool.ac.uk', 
    'full_name': 'CK Monaghan', 
    'phone': '+447395760103', 
    'purchase_date': '1722458363', 
    'line_items': [
        {
            'prod_id': 'prod_QQTrga8mShkzyo', 
            'price_id': 'price_1PgTOHEWkmdeWsQPNMogFUVa', 
            'description': 'Party Pass', 'amount_total': 3500
        }], 
    'access': [1, 0, 0, 1, 0, 1], 
    'status': 'paid_stripe', 
    'student_ticket': True, 
    'promo_code': None, 
    'meal_preferences': 
        {
            'choices': [-1, -1, -1], 
            'dietary_requirements': {'selected': [], 'other': ''}, 
            'seating_preference': []
        }, 
    'checkout_session': 'cs_test_b1Qqnk8dax1dOsWI49RPKTLf4E3mKcxjyJwB52j8scs1B4jC8gOXCJihEP', 
    'schedule': None, 
    'heading_message': 'THANK YOU FOR YOUR PURCHASE!', 
    'send_standard_ticket': True
}

print(lambda_handler(event, None))