import React, { useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function StripeForm({products,userData, preferences}) {
  const fetchClientSecret = useCallback(async () => {
    // Create a Checkout Session
    const stripe_session_options = {
      products:products, 
      userData: userData, 
      preferences: preferences
    }
    console.log("Creating Checkout Session:",products, stripe_session_options)
    const res = await fetch("/api/checkout/stripe_session", {
      method: "POST",
      body: JSON.stringify(stripe_session_options),
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