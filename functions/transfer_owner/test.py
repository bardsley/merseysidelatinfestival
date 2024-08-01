import json
import logging
from json.decoder import JSONDecodeError
from lambda_function import lambda_handler
logger = logging.getLogger()
logger.setLevel("INFO")

event = {
  "headers": {
    "x-amzn-tls-cipher-suite": "TLS_AES_128_GCM_SHA256",
    "content-length": "73",
    "x-amzn-tls-version": "TLSv1.3",
    "x-amzn-trace-id": "Root=1-668bcca5-2cd12ff37a8359ab52d2fcf0",
    "x-forwarded-proto": "https",
    "host": "xfq52qamc7bryozyug7f6r4mje0hugzo.lambda-url.eu-west-2.on.aws",
    "x-forwarded-port": "443",
    "content-type": "application/json",
    "x-forwarded-for": "134.158.197.169",
    "accept": "*/*",
    "user-agent": "curl/8.1.2"
  },
  "isBase64Encoded": False,
  "rawPath": "/",
  "routeKey": "$default",
  "requestContext": {
    "accountId": "anonymous",
    "timeEpoch": 1720437925864,
    "routeKey": "$default",
    "stage": "$default",
    "domainPrefix": "xfq52qamc7bryozyug7f6r4mje0hugzo",
    "requestId": "6bbc6b40-2e38-4d84-abd1-b26473ac6f4f",
    "domainName": "xfq52qamc7bryozyug76r4mje0hugzo.lambda-url.eu-west-2.on.aws",
    "http": {
      "path": "/",
      "protocol": "HTTP/1.1",
      "method": "POST",
      "sourceIp": "134.158.197.169",
      "userAgent": "curl/8.1.2"
    },
    "time": "08/Jul/2024:11:25:25 +0000",
    "apiId": "xfq52qamc7bryozyug7f6r4mje0hugzo"
  },
  "body": json.dumps({
      "email":"toaster_amylase0a@icloud.com", 
      "ticket_number":"7227400839", 
      "email_to":"toaster_amylase0a@icloud.com",
      "name_to":"T Enzyme",
      "phone_to":"+336797417",
      }),
  "version": "2.0",
  "rawQueryString": ""
}

print(lambda_handler(event, None))