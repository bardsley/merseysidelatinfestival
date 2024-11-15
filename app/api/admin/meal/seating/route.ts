import { createClerkClient } from '@clerk/backend';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function GET(_req: NextRequest) {
  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const {userId} = auth();

  if(!userId){
    return Response.json({error: "User is not signed in."}, { status: 401 });
  }

  const requestingUser = await clerkClient.users.getUser(userId);
  if(!requestingUser.publicMetadata.admin){
    return Response.json({error: "User is does not have permissions."}, { status: 401 });
  }

  const seatingUrl = process.env.LAMBDA_MEAL_SEATING
  console.log(seatingUrl)
  const seatingResponse = await fetch(seatingUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const seatingData = await seatingResponse.json()
  console.log(seatingData.seating_data)

  return seatingResponse.ok ? Response.json(seatingData) : Response.json({message: "Error"}, {status: 500})

}

export async function POST(request: Request) {
  const body = await request.json();
  const { fixedSeating, tableCapacities, movedRows } = body;

  const apiRequestBody = {
    fixed_tickets: fixedSeating,
    table_capacities: tableCapacities,
    moved_rows: movedRows,
    }
  console.log("POST -> Connor: ",apiRequestBody)

  const seatingUrl = process.env.LAMBDA_MEAL_SEATING

  fetch(seatingUrl, {
    method: 'POST',
    body: JSON.stringify(apiRequestBody)
  })
  return new Response(
    JSON.stringify({
      message: "Seating submitted and optimisation initiated.", 
      type: "good",
    }),
    {
      status: 202,
      headers: {'Content-Type': 'application/json',}
    }
  )
}