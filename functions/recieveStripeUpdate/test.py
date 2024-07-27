from lambda_function import lambda_handler
import json

event = {
   "version":"2.0",
   "routeKey":"$default",
   "rawPath":"/",
   "rawQueryString":"",
   "headers":{
      "content-length":"1252",
      "x-amzn-tls-version":"TLSv1.3",
      "x-forwarded-proto":"https",
      "x-forwarded-port":"443",
      "x-forwarded-for":"54.187.174.169",
      "accept":"*/*; q=0.5, application/xml",
      "x-amzn-tls-cipher-suite":"TLS_AES_128_GCM_SHA256",
      "x-amzn-trace-id":"Root=1-66a262ee-330b948547d9d25f1e51e68f",
      "stripe-signature":"t=1721918189,v1=87fe34cf9e838665847450a0bf14a8d8e5b288db48835b1b706988bf03172893,v0=e09314fcb3fe6c943b726dd3100ddd9f91b68bb4c7965435aa91c5c3f5fd3817",
      "host":"e5uh6jymrc3fkzs76dstzuramy0buolz.lambda-url.eu-west-2.on.aws",
      "content-type":"application/json; charset=utf-8",
      "cache-control":"no-cache",
      "user-agent":"Stripe/1.0 (+https://stripe.com/docs/webhooks)"
   },
   "requestContext":{
      "accountId":"anonymous",
      "apiId":"e5uh6jymrc3fkzs76dstzuramy0buolz",
      "domainName":"e5uh6jymrc3fkzs76dstzuramy0buolz.lambda-url.eu-west-2.on.aws",
      "domainPrefix":"e5uh6jymrc3fkzs76dstzuramy0buolz",
      "http":{
         "method":"POST",
         "path":"/",
         "protocol":"HTTP/1.1",
         "sourceIp":"54.187.174.169",
         "userAgent":"Stripe/1.0 (+https://stripe.com/docs/webhooks)"
      },
      "requestId":"a9e0bccf-c282-4793-a54d-20237b28217e",
      "routeKey":"$default",
      "stage":"$default",
      "time":"25/Jul/2024:14:36:30 +0000",
      "timeEpoch":1721918190331
   },
   "body":"{\n \"id\": \"evt_1PgSicEWkmdeWsQPCqcdp7D0\",\n \"object\": \"event\",\n \"api_version\": \"2022-11-15\",\n \"created\": 1721917954,\n \"data\": {\n \"object\": {\n \"id\": \"prod_QQUJ8m2jrR6toK\",\n \"object\": \"product\",\n \"active\": true,\n \"attributes\": [\n\n ],\n \"created\": 1720290490,\n \"default_price\": \"price_1PZdLDEWkmdeWsQPawG018VY\",\n \"description\": \"Description\",\n \"features\": [\n\n ],\n \"images\": [\n \"https://files.stripe.com/links/MDB8YWNjdF8xTjJkQURFV2ttZGVXc1FQfGZsX3Rlc3RfWG9YQ2t3ZEp5Qm1YelpsTFlueFMwOFNG00fd97m0uC\"\n ],\n \"livemode\": false,\n \"marketing_features\": [\n\n ],\n \"metadata\": {\n \"access\": \"[0,0,1,0,0,0]\"\n },\n \"name\": \"Saturday - Dinner\",\n \"package_dimensions\": null,\n \"shippable\": null,\n \"statement_descriptor\": null,\n \"tax_code\": \"txcd_10000000\",\n \"type\": \"service\",\n \"unit_label\": null,\n \"updated\": 1721917954,\n \"url\": null\n },\n \"previous_attributes\": {\n \"description\": null,\n \"updated\": 1720290491\n }\n },\n \"livemode\": false,\n \"pending_webhooks\": 1,\n \"request\": {\n \"id\": \"req_DLDcLZZqQVueiw\",\n \"idempotency_key\": \"2c44b095-402e-4126-8dff-199316a70842\"\n },\n \"type\": \"product.updated\"\n}",
   "isBase64Encoded":False
}
'''
Stripe object of a product update
{
    "object": {
      "id": "prod_QQUJ8m2jrR6toK",
      "object": "product",
      "active": True,
      "attributes": [],
      "created": 1720290490,
      "default_price": "price_1PZdLDEWkmdeWsQPawG018VY",
      "description": None,
      "features": [],
      "images": [
        "https://files.stripe.com/links/MDB8YWNjdF8xTjJkQURFV2ttZGVXc1FQfGZsX3Rlc3RfWG9YQ2t3ZEp5Qm1YelpsTFlueFMwOFNG00fd97m0uC"
      ],
      "livemode": False,
      "marketing_features": [],
      "metadata": {
        "access": "[0,0,1,0,0,0]"
      },
      "name": "Saturday - Dinner",
      "package_dimensions": None,
      "shippable": None,
      "statement_descriptor": None,
      "tax_code": "txcd_10000000",
      "type": "service",
      "unit_label": None,
      "updated": 1720290491,
      "url": None
    },
    "previous_attributes": {
      "default_price": None,
      "updated": 1720290490
    }
  })
}
'''
lambda_handler(event, None)