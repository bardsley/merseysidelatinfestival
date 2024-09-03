import { createClerkClient } from '@clerk/backend';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);  

export async function GET(_req: NextRequest) {
  const {userId} = auth();
  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

  if(!userId){
    return Response.json({error: "User is not signed in."}, { status: 401 });
  }
  const requestingUser = await clerkClient.users.getUser(userId);
  if(!requestingUser.publicMetadata.admin){
    return Response.json({error: "User is does not have permission to access stripe."}, { status: 401 });
  }
  // const products: Stripe.ApiList<Stripe.Product> = await stripe.products.list({active: true, expand: ['data.default_price']})
  // return Response.json({ products: products },{status: 400 });
  const webhooks: Stripe.ApiList<Stripe.WebhookEndpoint> = await stripe.webhookEndpoints.list({limit: 100})
  return Response.json({ webhooks: webhooks },{status: 200 });

}


export async function POST(_req: NextRequest) {
  const {userId} = auth();
  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

  if(!userId){
    return Response.json({error: "User is not signed in."}, { status: 401 });
  }
  const requestingUser = await clerkClient.users.getUser(userId);
  if(!requestingUser.publicMetadata.admin){
    return Response.json({error: "User is does not have permission to access stripe."}, { status: 401 });
  }
  const webhookEndpoint = await stripe.webhookEndpoints.create({
    enabled_events: ['charge.succeeded', 'charge.failed'],
    url: `https://${process.env.VERCEL_ENV}.api.engine.dance/test`,
  });

  return Response.json({ webhooks: webhookEndpoint },{status: 200 });
}

