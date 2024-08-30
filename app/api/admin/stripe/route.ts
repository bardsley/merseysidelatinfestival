import { createClerkClient } from '@clerk/backend';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

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

  return Response.json({ error: "Not implemented" },{status: 400 });

}