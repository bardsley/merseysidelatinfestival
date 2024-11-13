import { createClerkClient } from '@clerk/backend';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function GET() {
  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const {userId} = await auth();

  if(!userId){
    return Response.json({error: "User is not signed in."}, { status: 401 });
  }

  try {
    const response = await clerkClient.users.getUserList();
    const users = response.data.map((user) => {
      return {
        id: user.id,
        email: user.emailAddresses.find((email) => email.emailAddress !== null)?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        lastActiveAt: user.lastActiveAt,
        username: user.username,
        imageUrl: user.imageUrl,
        metadata: {
          public: user.publicMetadata,
          private: user.privateMetadata,
          unsafe: user.unsafeMetadata,
        },
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    });
    return Response.json({requester: userId, users: users},{status:200})
  } catch (error) {
    return Response.json({error: error},{status: 500})
  }
}

export async function POST(req: NextRequest) {
  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const {userId} = await auth();

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