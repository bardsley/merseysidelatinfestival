from lambda_function import lambda_handler

products = lambda_handler(None, None)

# days = ['Friday', 'Saturday', 'Sunday']
# # sub_dict = {prod_id: None for prod_id in [d for d in items if 'Friday' in d['prod_name']]}
# ind_tickets = {key: {prod_id: None for prod_id in [d for d in items if 'Friday' in d['prod_name']]} for key in days}

# print(ind_tickets)