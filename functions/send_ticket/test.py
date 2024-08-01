from lambda_function import lambda_handler

event = {
  "headers": {
    "x-amzn-tls-cipher-suite": "TLS_AES_128_GCM_SHA256",
    "x-amzn-tls-version": "TLSv1.3",
    "x-amzn-trace-id": "Root=1-668bd68f-5854cf2a14831b035d2e3725",
    "x-forwarded-proto": "https",
    "host": "ux66cekzyiffxqjobe3xbyuk7y0nzruu.lambda-url.eu-west-2.on.aws",
    "x-forwarded-port": "443",
    "x-forwarded-for": "134.158.197.169",
    "accept": "application/json",
    "user-agent": "curl/8.1.2"
  },
  "isBase64Encoded": False,
  "rawPath": "/",
  "routeKey": "$default",
  "requestContext": {
    "accountId": "anonymous",
    "timeEpoch": 1720440463111,
    "routeKey": "$default",
    "stage": "$default",
    "domainPrefix": "ux66cekzyiffxqjobe3xbyuk7y0nzruu",
    "requestId": "bfc438db-4b7d-48e3-bccc-2db1a85f7463",
    "domainName": "ux66cekzyiffxqjobe3xbyuk7y0nzruu.lambda-url.eu-west-2.on.aws",
    "http": {
      "path": "/",
      "protocol": "HTTP/1.1",
      "method": "GET",
      "sourceIp": "134.158.197.169",
      "userAgent": "curl/8.1.2"
    },
    "time": "08/Jul/2024:12:07:43 +0000",
    "apiId": "ux66cekzyiffxqjobe3xbyuk7y0nzruu"
  },
  "queryStringParameters": {
    "email": "connor1monaghan@gmail.com"
  },
  "version": "2.0",
}
print(lambda_handler(event, None))