Useful Links
============
- [Beta site (develop branch)](https://beta.merseysidelatinfestival.co.uk/)
- [Colour Pallette base ](https://coolors.co/02252f-001014-e23912-ffd20a-eee2df)

Deployment / Development Flow
=================================
1. Create a new branch from develop
2. Make changes until happy
3. Push to github
4. Create a pull request to develop
    1. It built successfully and youve playde with the preview?, Carry on to 5 and collect £200
    2. Do not pass go, fix it and go back to 2
5. Merge the pull request with a Squash and a nice message
6. Delete branch locally and on remote and switch back to develop (and pull you new single commit)
6. Create a pull request to main if happy to "go live"
7. Merge Commit to main (one feature = one commit)


TODO
======

Both to think and discuss
- [ ] Do we need the spreadsheet, could it be updated via a button in admin
- [ ] On the day payments

Adam
----
- [x] Merseyside small logo
- [ ] Optimise images
- [x] Video of dancing for hero
- [x] Add see through option for a section
- [x] Add title to features section
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
- [x] Studewnt banner on purchase card
- [x] Preferences Page
- [ ] Return page from checkout
- [ ] Clear cache on purchase
- [x] Messages not displayed on preferences page after log out
- [x] Licenseing stuff
- [x] Fixed develop branch disconnect?
- [x] Jumpto goes to right place on pass selector
- [x] Generate what I can from pricingDefaultDynamic
- [x] Fix pass selector to generate what to tick dynamically not just list all of same type
- [x] User management
- [x] Filtering creates extra Lindsays
- [ ] Scanned no signed in
- [ ] Checked in at, by, using
- [ ] Build a interface for cash sales
- [x] Do we need phone number on login
- [x] Student prices into checkout
- [x] Signout errors - Sort of fixed, redirect if a page doesn't exist
- [ ] Logout causes errors
- [ ] Return on unfiltered shouldn't auto sets
- [ ] Swap meal preferences admin only ¿Could this not use the same endpoint? Yes

Connor
------  
- [ ] update action for other lambda functions (workflow for deploying lambdas that don't exist)
- [x] Allow change name / email
- [x] capture history of owners and who transferred to
- [ ] check that a ticket is active when making meal updates
- [x] check ticket active when transferring
- [ ] Add a video of the dancing man
- [ ] add student 'banner' to ticket email
- [x] update resend email lambda
- [x] add new email templates to send_email
- [x] move email sending into new function
- [ ] capture history of meal preference changes
- [ ] purchase fulfilment for in-person payments (cash or card terminal)
- [ ] capture purchases otd (could be same as above and still send icket email)
- [ ] check if cs exist in db when checkout
- [ ] capture if discount codes have been used
- [ ] artist ticket 99XXXXXXX
- [ ] handle refunds
- [ ] Consolidate all the lambda roles and policies
- [ ] Email to all not selected meal options 
- [ ] Import from google into dynamodb
- [ ] create a live DB
- [ ] ?create new sendgrid
- [ ] Seating plan
- [ ] Send Adm the SVG files
- [ ] Document Lambda & make lambda robust
- [x] add additional info to checkout_complete 
- [x] Send me the link (for picture frame?) https://www.twibbonize.com
- [x] resend AWS access
- [x] Add link to email http://www.merseysidelatinfestival.com/preferences?email=adam.bardsley@gmail.com&ticket_number=5021048233
- [x] Style email with new logo and bigger it
- [x] checkout_complete timeout problem
- [x] Store phone numbers
- [x] generate price file dynamically and commit to git
- [x] create a dev DB
- [x] fix full pass access in stripe
- [ ] Send preference with wrong email and ticket should give an error
- [ ] Rename preferences function to ticket_information
- [ ] Add CloudWatch to check for Lambda errors and timeouts

**Thinking these might be on the wrong list because I don't remeber what they're for**
- [ ] Cutoff meal preferences

Karen
-----
- [ ] Video of dancing wide

When we have time
-----------------
- [x] Stripe integration for passes
- [ ] ticket upgrades
- [ ] Human assisted table optimisation, human says these people must sit here and the magic places everyone else


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
request checkout (no longer needed)
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
dyanamodb customer info table
---------------
```jsonc
{
  'email': "john_doe@example.com",      
  'ticket_number': "123456789",
  'full_name': "John Doe",
  'active': True|False,
  'purchase_date': 1721571296,
  'line_items': {[
    'amount_total': 4500,
    'description': 'Party Pass',
    'price_id': "price_xxxxx"
  }],
  'access': [1,0,0,1,0,1],
  'schedule': {
    // tbd
  },
  'meal_preferences': None|{
    // meal data format (see above)
  },
  'ticket_used': "false"|"75014206", // time/date of ticket being scanned as string
  'checkout_session': "cs_xxxxxx",
  'status': "paid_stripe"|"paid_cash"|"refunded_stripe"|"refunded_cash",
  'student_ticket': True|False,
  'promo_code': None|{
    'code': "MLF",
    'value': 500
  },
  'meal_preferences_history': None|{
    // meal data format (see above) plus...
    'updated_date': 1722471022,
    'source': "admin"|"customer" // when we have users could be admin-name
  },
  'transferred': None|{
    'date': 1722472454,
    'ticket_number': "123456789", // Will be the same if only the name changed and not the email
    'email': "john_doe@example.com", // new details of who it was transferred to 
    'full_name': "Johnnie Doe",
    'source': "admin"|"customer"
  }
  'owner_history': None|[{
    'date': 1721297593,
    'ticket_number': "678912345"
    'email':"jane.doe@example.com",
    'full_name': "Jane Doe",
    'source': "admin"|"customer"
  }]
}
```
request transfer ticket (lambda transfer_owner)
---------------
```jsonc
{
  'ticket_number': "123456789",
  'email': "jane.doe@example.com",
  'email_to': "new.email@example.com", // could be the same email if they only want to change the name
  'name_to': "Jennie Doe",
  'source': "admin"|"customer" // really I should be checking where it comes from not you telling me (future API)
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
