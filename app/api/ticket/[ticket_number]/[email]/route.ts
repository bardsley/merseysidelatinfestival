
import { currentUser } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';


export async function GET(_req: NextRequest, {params}:{ params: { email: string, ticket_number: string} } ) {
  // console.log("PARAMS",params)
  //  Check user object
  const user = await currentUser();
  if(!user){
    return Response.json({error: "User is not signed in!"}, { status: 401 });
  }
  if(!user.publicMetadata.admin){
    return Response.json({error: "User is does not have list tickets permissions."}, { status: 401 });
  }


  const apiRequest = `${process.env.LAMBDA_PREFERENCES}?requested=info&email=${params.email.replaceAll('+','%2B')}&ticketnumber=${params.ticket_number}`
  // const apiRequest = `${process.env.LAMBDA_PREFERENCES}?requested=info&email=${params.email}&ticketnumber=${params.ticket_number}`
  console.log(apiRequest)
  const currentAttendeeResponse = await fetch(apiRequest,{
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  const currentAttendee = await currentAttendeeResponse.json()

  return Response.json(currentAttendee, {status: 200})
}