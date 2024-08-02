// import { createClerkClient } from '@clerk/backend';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse, userAgent} from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { attachReactRefresh } from 'next/dist/build/webpack-config';


export async function POST(req: NextRequest) {
  const {userId} = auth();
  
  // Setup context
  const reqData = await req.json();
  const email = reqData.email;
  const ticket_number = parseInt(reqData.ticket_number);

  // Get current ticket

  let requester: boolean | string = false
  if(userId) {
    console.log(userId)
    const user = await currentUser() // && user && user.publicMetadata.role === 'admin' ? 'admin' : 'attendee'
    if(!user){ return Response.json({error: "User is not signed in."}, { status: 401 }); }
    if(!user.publicMetadata.admin){ return Response.json({error: "User is does not have change details permissions."}, { status: 401 });}
    requester = 'admin'
  } else {
    console.log(userId)
    requester = 'attendee'
  }
  
  const apiRequest = `${process.env.LAMBDA_PREFERENCES}?requested=validity&email=${email}&ticketnumber=${ticket_number}`

  const currentAttendeeResponse = await fetch(apiRequest,{
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  const attendeeValid = await currentAttendeeResponse.json()
  console.log(apiRequest, currentAttendeeResponse,attendeeValid)
  
  

  try {
    
    return NextResponse.json({requested_by: requester},{status:200})
  } catch (error) {
    return NextResponse.json({error: error},{status: 500})
  }
}
