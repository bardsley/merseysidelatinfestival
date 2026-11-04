import { tillPayment } from '@lib/terminal';
import { createClerkClient } from '@clerk/backend';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
export async function POST(request: Request) {
  const body = await request.json()
  console.log(body)

  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const {userId} = await auth();

  if(!userId){
    return Response.json({error: "User is not signed in."}, { status: 401 });
  }

  const requestingUser = await clerkClient.users.getUser(userId);
  if(!requestingUser.publicMetadata.admin){
    return Response.json({error: "User is does not have permissions."}, { status: 401 });
  }

  if (body.status === 'paid_card') {
    try {
      const intent = await tillPayment(body.checkout_session, userId);
      if (intent.status !== 'succeeded' || intent.currency !== 'gbp' || intent.amount_received !== body.checkout_amount) {
        return NextResponse.json({ error: 'Card payment has not completed for this amount.' }, { status: 400 });
      }
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  const checkoutUrl = process.env.LAMBDA_CHECKOUT_COMPLETE_INPERSON

  const checkoutResponse = await fetch(checkoutUrl, {
    method: 'POSt',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  })
  if(!checkoutResponse.ok) {
    const checkoutData = await checkoutResponse.json()
    return NextResponse.json({...checkoutData, generated_at: new Date().toISOString() }, {status: checkoutResponse.status})
  }
  const checkoutData = await checkoutResponse.json()
  const ticket_number = checkoutData.ticket_number
  // const ticket_number = 2212652493 //! This should be returned
  // console.log("checkoutData",checkoutData)
    return NextResponse.json({ ticket_number: ticket_number, generated_at: new Date().toISOString() })
  // }
}