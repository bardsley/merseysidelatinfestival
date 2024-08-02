// import { createClerkClient } from '@clerk/backend';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse} from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { attachReactRefresh } from 'next/dist/build/webpack-config';

export async function POST(req: NextRequest) {
  // const {userId} = auth();
  // Setup context
  const reqData = await req.json();
  const email = reqData.email;
  const ticket_number = parseInt(reqData.ticket_number);

  // Get current ticket
  const apiRequest = `${process.env.LAMBDA_PREFERENCES}?requested=meal&email=${email}&ticketnumber=${ticket_number}`

  const currentAttendeeResponse = await fetch(apiRequest,{
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  console.log(apiRequest, currentAttendeeResponse)
  

  // if(!userId){ return Response.json({error: "User is not signed in."}, { status: 401 }); }

  // const user = await currentUser();
  // if(!user){ return Response.json({error: "User is not signed in."}, { status: 401 }); }
  // if(!user.publicMetadata.admin){ return Response.json({error: "User is does not have change details permissions."}, { status: 401 });}

  // if(attachReactRefresh)
  
  // const attendeeData = await attendeesResponse.json()
  // console.log(attendeeData)
  // const attendees = attendeeData.Items.map((attendee) => {

  //   const transferred_out = attendee.transferred && attendee.transferred.ticket_number != attendee.ticket_number
  //   const name_changed = attendee.transferred && attendee.transferred.ticket_number == attendee.ticket_number
  //   const transferred_in = !name_changed && attendee.history

  //   return {
  //     name: attendee.full_name,
  //     email: attendee.email,
  //     checkin_at: attendee.ticket_used,
  //     passes: attendee.line_items.map((item) => item.description),
  //     purchased_at: new Date(parseInt(attendee.purchase_date) * 1000).toISOString(),
  //     ticket_number: attendee.ticket_number,
  //     active: attendee.active,
  //     status: attendee.status,
  //     student_ticket: attendee.student_ticket,
  //     transferred_in: transferred_in ? attendee.history[0].ticket_number : false,
  //     transferred_out: transferred_out && attendee.history && attendee.history[0] ? attendee.history[0]  : false, //! TODO why is it transferred out without a history
  //     name_changed: name_changed,
  //     transferred: attendee.transferred,
  //     history: attendee.history,

  //   };
  // })

  try {
    
    return NextResponse.json({current: currentAttendee},{status:200})
  } catch (error) {
    return NextResponse.json({error: error},{status: 500})
  }
}
