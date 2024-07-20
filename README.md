[Colour Pallette base ](https://coolors.co/02252f-001014-e23912-ffd20a-eee2df)

TODO
======

Adam
----
[ ] Merseyside small logo
[ ] Optimise images
[ ] Video of dancing for hero
[ ] Add see through option for a section
[ ] Add title to features section
[ ] Disclaimer on food choices
[ ] Default prose styles e.g. <article class="prose prose-img:rounded-xl prose-headings:underline prose-a:text-blue-600">{{ markdown }}</article>
[X] Hydration error in production
[ ] Reverse artist video animation 
[x] Student isn't coming through 
[ ] Way to hide pages
[x] Passes card at top
[x] Student Saving in passes

Connor
------  
[ ] Add a video of the dancing man
[ ] Send Adm the SVG files
[ ] Send me the link
[ ] Email to all not selected options 
[ ] artist ticket 99XXXXXXX

[ ] resend AWS access
[ ] Document Lambda & make lambda robust

Karen
-----
[ ] Video of dancing wide

When we have time
-----------------
[ ] Stripe integration for passes

Purchasing Rules
----------------


name: "Adam",
email "Email"
number_of_tickets: 1,
line_items: [
  { name: "Party pass", stripe_product_id: 456798, access: [1,0,0,1,0,1] },
  { name: "Dinner Option", stripe_product_id: 456798, access: [0,0,1,0,0,0] },
]
price: 100

chgeckout
emails

*********************
****  ENDPOINTS  ****
*********************

*********************
** send my ticket ***
*
* lambda function: send_ticket
* status: functional (test data)
* 

url: https://ux66cekzyiffxqjobe3xbyuk7y0nzruu.lambda-url.eu-west-2.on.aws/?email={{email}}

description: Makes a query of the DynamoDB of customer tickets, if the email is present will send the ticket(s) to 
that email. If multiple entries for that email exist, customer will receive an email for each ticket. 

method: GET

parameters: email- The query email

returns:status

status codes: 200 OK
405 Method Not Allowed

cURL example:
curl -H "Accept: application/json" \
'https://ux66cekzyiffxqjobe3xbyuk7y0nzruu.lambda-url.eu-west-2.on.aws/?email=connor1monaghan%40gmail.com'

curl -H "Accept: application/json" \
'https://ux66cekzyiffxqjobe3xbyuk7y0nzruu.lambda-url.eu-west-2.on.aws/?email=adam.bardsley%40gmail.com'

*********************
*** customer data ***
*
* lambda function: 
* status: functional (test data)
* 

url: https://x4xy6yutqmildatdl3qc53bnzu0bhbdf.lambda-url.eu-west-2.on.aws/

description: Retrieve the meal options of schedule options of a customer, searching the db is done only with ticket
number which but be valid.

method: GET

parameters: requested- Comma separate list of type of customer data to return. Valid options: meal, schedule
email- The customer email
ticketnumber- The customer ticket number

returns:JSON of the 'meal options' entry and/or of the 'schedule options' entry

status codes: 200 OK
400 Ticket number does not exist
405 Method Not Allowed

cURL example:
curl -H "Accept: application/json" \
'https://x4xy6yutqmildatdl3qc53bnzu0bhbdf.lambda-url.eu-west-2.on.aws/?requested=meal,schedule&email=connor1monaghan%40gmail.com&ticketnumber=3911997684'

*********************


url: https://x4xy6yutqmildatdl3qc53bnzu0bhbdf.lambda-url.eu-west-2.on.aws/

description: Update a customer entry in the db with the provided meal options and/or schedule. Request data must include
at least one of 'meal_options' or 'schedule'.

method: POST

parameters: email- The customer email
ticketnumber- The customer ticket number
meal_options- (optional) dict of meal options
schedule- (optional) dict of schedule options

returns:status

status codes: 200 OK
400 Ticket number does not exist
405 Method Not Allowed

cURL example:
curl -H 'Content-Type: application/json' \
          -d '{"email":"connor1monaghan@gmail.com", "ticket_number":1111111, "meal_options":{}}' \
          -X POST https://x4xy6yutqmildatdl3qc53bnzu0bhbdf.lambda-url.eu-west-2.on.aws/


*********************************************************************************************************