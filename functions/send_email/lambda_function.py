import ssl

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    # Legacy Python that doesn't verify HTTPS certificates by default
    pass
else:
    # Handle target environment that doesn't support HTTPS verification
    ssl._create_default_https_context = _create_unverified_https_context

from string import Template
import base64
import sendgrid
from sendgrid.helpers.mail import *
import qrcode
import io
import babel.numbers
import os
import json
import logging
logger = logging.getLogger()
logger.setLevel("INFO")
# logging.basicConfig()

sendgrid_api_key = os.environ.get("SENDGRID_API_KEY")
    
def generate_standard_ticket_body(data):
    rows = ""
    total_amount = 0
    # generate table of items purchased
    for i in data['line_items']:
        with open("./ticket_row.html", 'r') as line_item_row_file:
            line_item_tmpl = Template(line_item_row_file.read())
            rows = rows+"\n"+line_item_tmpl.substitute({
                'tickettype':i['description'], 
                'qty':1, 
                'price':babel.numbers.format_currency(i['amount_total']/100, "GBP", locale='en_UK')
            })
            total_amount += i['amount_total']
    # create total row
    with open("./ticket_row.html", 'r') as total_row_file:
        total_tmpl = Template(total_row_file.read())
        total_row = total_tmpl.substitute({
            'tickettype':"", 
            'qty':"<strong>Total</strong>", 
            'price':"<strong>"+babel.numbers.format_currency(total_amount/100, "GBP", locale='en_UK')+"</strong>"
        })
    
    with open("./ticket_body.html", "r") as body_file:
        body_tmpl = Template(body_file.read())
        body = body_tmpl.substitute({
            'fullname':data['name'], 
            'email':data['email'], 
            'ticketnumber':data['ticket_number'], 
            'rows':rows, 
            'ticket_link':"http://app.merseysidelatinfestival.co.uk/preferences?email={}&ticket_number={}".format(data['email'], data['ticket_number']), 
            'total_row':total_row,
            'heading_message':data['heading_message']
        })   
    return body

def lambda_handler(event, context):
    
    logger.info(event)

    if event['email_type'] == "standard_ticket":
        logger.info("Generating a standard ticket email")
        # generate qr code
        logger.info("Create QR code")
        qr_ticket = qrcode.make(event['ticket_number'], box_size=8, version=3)
        qr_byte_arr = io.BytesIO()
        qr_ticket.save(qr_byte_arr)
        qr_byte_arr = qr_byte_arr.getvalue()
        encoded = base64.b64encode(qr_byte_arr).decode()
        attachment = Attachment(FileContent(encoded),FileName('qrticket.jpg'), FileType('image/jpeg'), Disposition('inline'), ContentId('qr-ticket'))
        
        logger.info("Generate the body of the email")
        body = generate_standard_ticket_body(event)
        subject = 'Merseyside Latin Festival Ticket Confirmation'

    else:
        return False

    with open("./header_footer.html", "r") as header_footer_file:
        logger.info("Insert the body of the email into header and footer")
        header_footer_tmpl = Template(header_footer_file.read())
        html_content = header_footer_tmpl.substitute({'body':body})

    # put body in with header

    # Generate the sendgrid message
    logger.info("Create the Mail object")
    message = Mail(
        from_email='do-not-reply@em4840.merseysidelatinfestival.co.uk',
        to_emails=event['email'],
        subject=subject,
        html_content=html_content
        )
    
    logger.info("Adding attachements if any exist")
    message.attachment = attachment if attachment else None

    logger.info("Attempting to send email")
    try:
        sg = sendgrid.SendGridAPIClient(api_key=sendgrid_api_key)
        response = sg.send(message)
        return "Success"
    except Exception as e:
        print(e.message)
        return e