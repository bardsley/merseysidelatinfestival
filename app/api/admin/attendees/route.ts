import { createClerkClient } from '@clerk/backend';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  const {userId} = auth();

  if(!userId){
    return Response.json({error: "User is not signed in."}, { status: 401 });
  }

  const user = await currentUser();
  if(!user){
    return Response.json({error: "User is not signed in."}, { status: 401 });
  }
  if(!user.publicMetadata.admin){
    return Response.json({error: "User is does not have list tickets permissions."}, { status: 401 });
  }

  const attendeesResponse = await fetch(`${process.env.LAMBDA_GETATTENDEES}`,{
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const attendeeData = await attendeesResponse.json()
  // console.log(attendeeData)
  const attendees = attendeeData.Items.map((attendee) => {

    const transferred_out = attendee.transferred && attendee.transferred.ticket_number != attendee.ticket_number
    const name_changed = attendee.transferred && attendee.transferred.ticket_number == attendee.ticket_number
    const transferred_in = !name_changed && attendee.history

    return {
      name: attendee.full_name,
      email: attendee.email,
      checkin_at: attendee.ticket_used,
      passes: attendee.line_items.map((item) => item.description),
      purchased_at: new Date(parseInt(attendee.purchase_date) * 1000).toISOString(),
      ticket_number: attendee.ticket_number,
      active: attendee.active,
      status: attendee.status,
      student_ticket: attendee.student_ticket,
      transferred_in: transferred_in ? attendee.history[0].ticket_number : false,
      transferred_out: transferred_out && attendee.history && attendee.history[0] ? attendee.history[0]  : false, //! TODO why is it transferred out without a history
      name_changed: name_changed,
      transferred: attendee.transferred,
      history: attendee.history,

    };
  })

  try {
    
    return Response.json({attendees: attendees},{status:200})
  } catch (error) {
    return Response.json({error: error},{status: 500})
  }
}

export async function POST(req: NextRequest) {
  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const {userId} = auth();

  if(!userId){
    return Response.json({error: "User is not signed in."}, { status: 401 });
  }

  const requestingUser = await clerkClient.users.getUser(userId);
  if(!requestingUser.publicMetadata.admin){
    return Response.json({error: "User is does not have permission to make admin."}, { status: 401 });
  }

  const reqJson = await req.json();
  const affectedUserId = reqJson.userId;
  const permission = reqJson.permission;
  const value = reqJson.value;
  try {
    await clerkClient.users.updateUserMetadata(affectedUserId, {
      publicMetadata: { [permission]: value }
    });
  } 
  catch (error) {
    return Response.json({error: error},{status: 500})
  }
  
  return Response.json({message: "User is now an admin"}, {status: 200})
}