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

sendgrid_api_key = os.environ.get("SENDGRID_API_KEY")

def genHTML(fullname, email, ticketnumber, items, ticket_link):
    rows = ""
    total_amount = 0
    for i in items['data']:
        with open("./html_row.html", 'r') as file:
            tmpl = Template(file.read())
            rows = rows+"\n"+tmpl.substitute({'tickettype':i['description'], 'qty':1, 'price':babel.numbers.format_currency(i['amount_total']/100, "GBP", locale='en_UK')})
            total_amount += i['amount_total']
    with open("./html_row.html", 'r') as file:
        tmpl = Template(file.read())
        total_row = tmpl.substitute({'tickettype':"", 'qty':"<strong>Total</strong>", 'price':"<strong>"+babel.numbers.format_currency(total_amount/100, "GBP", locale='en_UK')+"</strong>"})
    with open("./html_tmpl.html", 'r') as file:
        tmpl_f = Template(file.read())
        return tmpl_f.substitute({'fullname':fullname, 'email':email, 'ticketnumber':ticketnumber, 'rows':rows, 'ticket_link':ticket_link, 'total_row':total_row})

def lambda_handler(event, context):

    data = json.loads(event['body'])

    full_name     = data['name']
    email         = data['email']
    ticket_number = data['ticket_number']
    line_items    = data['line_items']
    ticket_link = "http://app.merseysidelatinfestival.co.uk/preferences?email={}&ticket_number={}".format(email, ticket_number)

    # Generate the sendgrid message
    message = Mail(
        from_email='do-not-reply@em4840.merseysidelatinfestival.co.uk',
        to_emails=email,
        subject='Merseyside Latin Festival Ticket Confirmation',
        html_content=genHTML(full_name, email, ticket_number, line_items, ticket_link)
        )

    ## Code using PIL    
    # qr_ticket = qrcode.make(ticket_number).resize((200,200))
    # qr_byte_arr = io.BytesIO()
    # qr_ticket.save(qr_byte_arr, format='PNG')
    # qr_byte_arr = qr_byte_arr.getvalue()

    qr_ticket = qrcode.make(ticket_number, box_size=8, version=3)
    qr_byte_arr = io.BytesIO()
    qr_ticket.save(qr_byte_arr)
    qr_byte_arr = qr_byte_arr.getvalue()

    encoded = base64.b64encode(qr_byte_arr).decode()
    attachment = Attachment(FileContent(encoded),FileName('qrticket.jpg'), FileType('image/jpeg'), Disposition('inline'), ContentId('qr-ticket'))
    message.attachment = attachment
    try:
        sg = sendgrid.SendGridAPIClient(api_key=sendgrid_api_key)
        response = sg.send(message)
        return response
    except Exception as e:
        print(e.message)
        return e