// import { createClerkClient } from '@clerk/backend';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  const {userId} = auth();
  
  // Setup context
  const reqData = await req.json();
  const orig_email = reqData.email;
  const orig_ticket_number = parseInt(reqData.ticket_number);
  const replacement_data = reqData.replace;

  // Get current ticket

  let requester: boolean | string = false
  if(userId) {
    const user = await currentUser() // && user && user.publicMetadata.role === 'admin' ? 'admin' : 'attendee'
    if(!user){ return Response.json({error: "User is not signed in."}, { status: 401 }); }
    if(!user.publicMetadata.admin){ return Response.json({error: "User is does not have change details permissions."}, { status: 401 });}
    requester = 'admin'
  } else {
    requester = 'attendee'
  }
  
  const apiRequest = `${process.env.LAMBDA_PREFERENCES}?requested=info&email=${orig_email}&ticketnumber=${orig_ticket_number}`

  const currentAttendeeResponse = await fetch(apiRequest,{
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  const attendeePreviousData = await currentAttendeeResponse.json()
  if(process.env.NEXT_PUBLIC_INTERNAL_DEBUG) { console.log(apiRequest, currentAttendeeResponse,attendeePreviousData) }
  
  
  if(attendeePreviousData.error) { return Response.json({error: attendeePreviousData.error}, { status: 400 }); }
  if(attendeePreviousData.length < 0) { return Response.json({error: "No tickets"}, { status: 400 }); }
  if(attendeePreviousData.length > 1) { return Response.json({error: "Multiple tickets match"}, { status: 400 }); }
  if(attendeePreviousData[0].ticket_used) { return Response.json({error: "Ticket has already been used."}, { status: 400 }); }
  if(attendeePreviousData[0].status == 'gratis') { return Response.json({error: "You can't transfer a gifted ticket."}, { status: 400 }); }

  if(process.env.NEXT_PUBLIC_INTERNAL_DEBUG) { console.log("attendeePreviousData",attendeePreviousData[0]) }

  const previousAttendee = attendeePreviousData[0]
  const name = replacement_data.name ? replacement_data.name : previousAttendee.name
  const email = replacement_data.email ? replacement_data.email : previousAttendee.email
  const phone = replacement_data.phone ? replacement_data.phone : previousAttendee.phone

  const newTicketInfo  = {
    ticket_number: `${orig_ticket_number}`,
    email: orig_email,
    name_to: name,
    email_to: email,
    phone_to: phone
  }

  if(process.env.NEXT_PUBLIC_INTERNAL_DEBUG) { console.log("newTicketInfo",newTicketInfo) }
  const transferApiRequest = `${process.env.LAMBDA_TRANSFER_OWNER}`
  const transferResponse = await fetch(transferApiRequest,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newTicketInfo)
  })
  const transferResponseData = transferResponse.ok ? await transferResponse.json() : await transferResponse.text()
  if(process.env.NEXT_PUBLIC_INTERNAL_DEBUG) { console.log(transferApiRequest, transferResponse,transferResponseData) }


  try {
    
    return NextResponse.json({requested_by: requester},{status:200})
  } catch (error) {
    return NextResponse.json({error: error},{status: 500})
  }
}
