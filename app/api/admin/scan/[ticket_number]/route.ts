import { createClerkClient } from '@clerk/backend';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getUnixTime } from 'date-fns';

export async function GET(_req: NextRequest,{params}: {params: {ticket_number: string}}) {
  const {userId} = await auth();

  if(!userId){
    return Response.json({error: "User is not signed in to GET."}, { status: 401 });
  }

  const user = await currentUser();
  if(!user){
    return Response.json({error: "User is not signed in to GET user details!"}, { status: 401 });
  }
  if(!user.publicMetadata.admin){
    return Response.json({error: "User is does not have list tickets permissions."}, { status: 401 });
  }
const scanUrl = `${process.env.LAMBDA_SCAN_TICKET}?ticket_number=${params.ticket_number}`
console.log(scanUrl)
  const scanResponse = await fetch(scanUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const attendeeData = await scanResponse.json()

  try {
    return attendeeData.error ? Response.json({error: attendeeData.error},{status:scanResponse.status}) : Response.json({attendee: attendeeData},{status:200})
  } catch (error) {
    return Response.json({error: error},{status: 500})
  }
}

export async function POST(req: NextRequest,{params}: {params: {ticket_number: string}}) {
  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const {userId} = await auth();

  if(!userId){
    return Response.json({error: "User is not signed in to POST change."}, { status: 401 });
  }

  const requestingUser = await clerkClient.users.getUser(userId);
  if(!requestingUser.publicMetadata.admin){
    return Response.json({error: "User is does not have permission to make admin."}, { status: 401 });
  }

  const reqJson = await req.json();
  const ticket_number = params.ticket_number;
  const email = reqJson.email;
  const check_in_at = reqJson.reset ? false : getUnixTime(new Date());
  const bodyData = {
    ticket_number: ticket_number,
    email: email,
    check_in_at: check_in_at
  }
  console.log(bodyData)
  try {
    const response = await fetch(`${process.env.LAMBDA_SCAN_TICKET}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData)
    })
    const data = await response.json()
    return Response.json({message: data.message},{status: 200})
  } catch (error) {
    return Response.json({error: error},{status: 500})
  } 
}