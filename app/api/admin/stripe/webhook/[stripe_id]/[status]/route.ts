import { createClerkClient } from '@clerk/backend';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);  

export async function POST(_req: NextRequest, {params}:{ params: { stripe_id: string, status: string } }) {
  const {userId} = auth();
  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

  if(!userId){
    return Response.json({error: "User is not signed in."}, { status: 401 });
  }
  const requestingUser = await clerkClient.users.getUser(userId);
  if(!requestingUser.publicMetadata.admin){
    return Response.json({error: "User is does not have permission to access stripe."}, { status: 401 });
  }

  const newStatus = params.status === "enable" ? true : false;

  const actionOutcome = await stripe.webhookEndpoints.update(
    params.stripe_id,
    {
      disabled: newStatus,
    }
  );
  console.log("StripeID", params.stripe_id, "newStatus", newStatus, "Response", actionOutcome)
  return Response.json({ success: actionOutcome },{status: 200 });

}