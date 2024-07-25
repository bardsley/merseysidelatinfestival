import React, { useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function StripeForm({products,email}) {
  const fetchClientSecret = useCallback(async () => {
    // Create a Checkout Session
    console.log("Creating Checkout Session:",products)
    const res = await fetch("/api/checkout/stripe_session", {
      method: "POST",
      body: JSON.stringify({products:products,email:email}),
    })
    const data = await res.json();
    return data.clientSecret;
  }, []);

  const options = {fetchClientSecret};

  return (
    <div id="checkout" className='w-full'>
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={options}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}