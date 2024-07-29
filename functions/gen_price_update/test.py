from lambda_function import lambda_handler
from github import Auth
from github import Github
import os
from pprint import pprint

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