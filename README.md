[Colour Pallette base ](https://coolors.co/02252f-001014-e23912-ffd20a-eee2df)

TODO
======
Next Chat
- [ ] Should we store last checkout if not completed? Yes
- [ ] Benefits of recalculating passes etc based on options on post checkout vs passing them into the checkout and along to API?

Adam
----
- [ ] Merseyside small logo
- [ ] Optimise images
- [ ] Video of dancing for hero
- [x] Add see through option for a section
- [ ] Add title to features section
- [ ] Disclaimer on food choices
- [ ] Default prose styles e.g. <article class="prose prose-img:rounded-xl prose-headings:underline prose-a:text-blue-600">{{ markdown }}</article>
- [X] Hydration error in production
- [x] Reverse artist video animation 
- [x] Student isn't coming through 
- [x] Way to hide pages
- [x] Passes card at top
- [x] Student Saving in passes
- [x] Make star in small logo smaller
- [x] Big logo, lineup angles, texture on cut a dn a is too big
- [x] Understand why github has a failing action
- [x] deal with isAvailable changes
- [x] Proect Main branch - Can't commit directly into main have to PR
- [x] Passes not available tdon't get auto triggered e.g dinner pass nbot available select options
- [ ] Allow change name / email.
- [ ] Studewnt banner on purchase card
- [ ] Preferences Page
- [ ] Return page from checkout
- [ ] Clear cache on purchase

Connor
------  
- [ ] Add a video of the dancing man
- [ ] Send Adm the SVG files
- [x] Send me the link (for picture frame?) https://www.twibbonize.com
- [ ] Email to all not selected meal options 
- [ ] artist ticket 99XXXXXXX
- [ ] Explore discount code functionality
- [x] resend AWS access
- [ ] Document Lambda & make lambda robust
- [ ] Allow change name / email.

Karen
-----
- [ ] Video of dancing wide

When we have time
-----------------
- [ ] Stripe integration for passes

Last Meeting
------------
- Draft Mode ✔️
- Singage Dashboard ✔️
- Screens ✔️
- Git ✔️
- Logo ✔️
- Meal options ✔️
- Preview deployments ✔️



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

Data Structures
===============
meal data
---------
This is how the data will be stored in db. 

TBD: Send in this structure in the checkout link request as below. Otherwise just process it in the request and store in db like this. (The former is better.)
```jsonc
{
  'choices': [1,0,1], 
  'dietary_requirements':{
    'selected':["nut allergy", "gluten free", ...], // list of requirements selected from a list
    'other': "Some specific additional dietary requirement"
  },
  'seating_preference': ["12345", "12678", ...] // list of ticket numbers of people they want to sit with
}
```
request checkout 
-----------------
```jsonc
{
  'name': "John Doe",
  'email': "john_doe@example.com",
  'number_of_tickets': 1,
  'line_items': [
    {'name': "Party Pass", 'stripe_product_id': "prod_QQTrga8mShkzyo", 'access': [1,0,0,1,0,1]},
    {'name': "Saturday-Dinner", 'stripe_product_id': "prod_QQUJ8m2jrR6toK", 'access': [0,0,1,0,0,0]}
  ],
  'meal': {}, //meal data format (optional)
  'promo_code': "promo_******" // (optional)
}
```
dyanamodb table
---------------
```jsonc
{
  'email': "john_doe@example.com",      
  'ticket_number': 123456789,
  'full_name': "John Doe",
  'line_items': {
    'amount_total': 4500,
    'description': 'Party Pass'
  },
  'access': [1,0,0,1,0,1],
  'schedule': {
    // tbd
  },
  'meal_options':{
    // meal data format (see above)
  },
  'ticket_used': "", // time/date of ticket being scanned
}
```
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
