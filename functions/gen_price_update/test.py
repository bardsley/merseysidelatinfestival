from lambda_function import lambda_handler
import boto3 
import logging

#* This is not required for deployment only needed for local testing 
profile_name='AdministratorAccess-645491919786'
boto3.setup_default_session(profile_name=profile_name)
logging.basicConfig()

products = lambda_handler(None, None)

# auth = Auth.Token(os.environ.get("GITHUB_TOKEN"))
# git = Github(auth=auth)
# # git.get_user().login

# repo = git.get_repo("bardsley/merseysidelatinfestival")

# path = "components/ticketing/pricingDefaultsDynamic.ts"
# branch = "pricing"

# try:
#     contents = repo.get_contents(path, branch)
# except:
#     repo.create_file(path, "create dynamic pricing file", content, branch=branch, author=author)
#     print("File not found")
# pprint(contents.decoded_content.decode("utf-8"), width=200)