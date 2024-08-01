from lambda_function import lambda_handler
import json

object = {
  "object": {
    "id": "cs_test_b1Qqnk8dax1dOsWI49RPKTLf4E3mKcxjyJwB52j8scs1B4jC8gOXCJihEP",
    "object": "checkout.session",
    "after_expiration": None,
    "allow_promotion_codes": True,
    "amount_subtotal": 3500,
    "amount_total": 3500,
    "automatic_tax": {
      "enabled": False,
      "liability": None,
      "status": None
    },
    "billing_address_collection": None,
    "cancel_url": None,
    "client_reference_id": None,
    "client_secret": None,
    "consent": None,
    "consent_collection": None,
    "created": 1722458363,
    "currency": "gbp",
    "currency_conversion": None,
    "custom_fields": [],
    "custom_text": {
      "after_submit": None,
      "shipping_address": None,
      "submit": None,
      "terms_of_service_acceptance": None
    },
    "customer": None,
    "customer_creation": "if_required",
    "customer_details": {
      "address": {
        "city": None,
        "country": "FR",
        "line1": None,
        "line2": None,
        "postal_code": None,
        "state": None
      },
      "email": "c.monaghan@liverpool.ac.uk",
      "name": "C K M",
      "phone": None,
      "tax_exempt": "none",
      "tax_ids": []
    },
    "customer_email": "c.monaghan@liverpool.ac.uk",
    "expires_at": 1722544762,
    "invoice": None,
    "invoice_creation": {
      "enabled": False,
      "invoice_data": {
        "account_tax_ids": None,
        "custom_fields": None,
        "description": None,
        "footer": None,
        "issuer": None,
        "metadata": {},
        "rendering_options": None
      }
    },
    "livemode": False,
    "locale": None,
    "metadata": {
      "attendee": "{\"name\":\"CK Monaghan\",\"phone\":\"+447395760103\"}",
      "preferences": "{\"choices\":[-1,-1,-1],\"dietary_requirements\":{\"selected\":[],\"other\":\"\"},\"seating_preference\":[]}"
    },
    "mode": "payment",
    "payment_intent": "pi_3PijJCEWkmdeWsQP1DfGlEyE",
    "payment_link": None,
    "payment_method_collection": "if_required",
    "payment_method_configuration_details": {
      "id": "pmc_1N2dDLEWkmdeWsQPFQTcTfTn",
      "parent": None
    },
    "payment_method_options": {
      "card": {
        "request_three_d_secure": "automatic"
      }
    },
    "payment_method_types": [
      "card",
      "link"
    ],
    "payment_status": "paid",
    "phone_number_collection": {
      "enabled": False
    },
    "recovered_from": None,
    "redirect_on_completion": "always",
    "return_url": "https://app.merseysidelatinfestival.co.uk/return?session_id={CHECKOUT_SESSION_ID}",
    "saved_payment_method_options": None,
    "setup_intent": None,
    "shipping_address_collection": None,
    "shipping_cost": None,
    "shipping_details": None,
    "shipping_options": [],
    "status": "complete",
    "submit_type": None,
    "subscription": None,
    "success_url": None,
    "total_details": {
      "amount_discount": 0,
      "amount_shipping": 0,
      "amount_tax": 0
    },
    "ui_mode": "embedded",
    "url": None
  },
  "previous_attributes": None
}

body = {
    'data':object,
    'type':"checkout.session.completed"
}

print(lambda_handler({'body':json.dumps(body)}, None))