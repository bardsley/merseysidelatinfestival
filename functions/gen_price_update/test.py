from lambda_function import lambda_handler
import boto3 
import logging

#* This is not required for deployment only needed for local testing 
profile_name='AdministratorAccess-645491919786'
boto3.setup_default_session(profile_name=profile_name)
logging.basicConfig()

products = lambda_handler(None, None)