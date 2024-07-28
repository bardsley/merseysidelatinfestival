import gspread
from google.oauth2.service_account import Credentials
import logging
import json
import os
logger = logging.getLogger()
logger.setLevel("INFO")

account_file = os.environ.get("GOOGLE_ACCOUNT_FILE")

google_sheet_key = os.environ.get("GOOGLE_SHEET_KEY")

print(account_file)

def init():
    scopes = ['https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive']

    credentials = Credentials.from_service_account_file(account_file, scopes=scopes)

    gc = gspread.authorize(credentials)

    # open a google sheet
    try:
        gs = gc.open_by_key(google_sheet_key)
    except gspread.exceptions.APIError as err:
        logger.error(err)
        return
    return gs

def update_gs(data):
    gs = init()
    logger.info("Writing data to google spreadsheet.")
    response = gs.values_append('Sheet1', {'valueInputOption': 'RAW'}, {'values': [data]})
    return response