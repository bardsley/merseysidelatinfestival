import ssl
from string import Template

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    # Legacy Python that doesn't verify HTTPS certificates by default
    pass
else:
    # Handle target environment that doesn't support HTTPS verification
    ssl._create_default_https_context = _create_unverified_https_context

import base64
import sendgrid
from sendgrid.helpers.mail import *
import qrcode
import io
import babel.numbers


def genHTML(fullname, email, ticketnumber, items):
    rows = ""
    for i in items['data']:
        with open("/opt/python/html_row.html", 'r') as file:
            tmpl = Template(file.read())
            rows = rows+"\n"+tmpl.substitute({'tickettype':i['description'], 'qty':1, 'price':babel.numbers.format_currency(i['amount_total']/100, "GBP", locale='en_UK')})
    with open("/opt/python/html_tmpl.html", 'r') as file:
        tmpl_f = Template(file.read())
        return tmpl_f.substitute({'fullname':fullname, 'email':email, 'ticketnumber':ticketnumber, 'rows':rows})

def sendemail(full_name, email, ticket_number, line_items):

    # Generate the sendgrid message
    message = Mail(
        from_email='do-not-reply@em4840.merseysidelatinfestival.co.uk',
        to_emails=email,
        subject='Merseyside Latin Festival Ticket Confirmation',
        html_content=genHTML(full_name, email, ticket_number, line_items))

    ## Code using PIL    
    # qr_ticket = qrcode.make(ticket_number).resize((200,200))
    # qr_byte_arr = io.BytesIO()
    # qr_ticket.save(qr_byte_arr, format='PNG')
    # qr_byte_arr = qr_byte_arr.getvalue()

    qr_ticket = qrcode.make(ticket_number, box_size=6)
    qr_byte_arr = io.BytesIO()
    qr_ticket.save(qr_byte_arr)
    qr_byte_arr = qr_byte_arr.getvalue()

    encoded = base64.b64encode(qr_byte_arr).decode()
    attachment = Attachment(FileContent(encoded),FileName('qrticket.jpg'), FileType('image/jpeg'), Disposition('inline'), ContentId('qr-ticket'))
    message.attachment = attachment
    try:
        sg = sendgrid.SendGridAPIClient(api_key='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')
        response = sg.send(message)
        return response
    except Exception as e:
        print(e.message)
        return e