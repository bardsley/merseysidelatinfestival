import { createClerkClient } from '@clerk/backend';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function GET(_req: NextRequest) {
  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "User is not signed in." }, { status: 401 });
  }

  const requestingUser = await clerkClient.users.getUser(userId);
  if (!requestingUser.publicMetadata.admin) {
    return Response.json({ error: "User does not have permissions." }, { status: 401 });
  }

  try {
    const messagesUrl = process.env.LAMBDA_GET_MESSAGES;
    const whatsappNumber = process.env.WHATSAPP_NUMBER;

    if (!messagesUrl || !whatsappNumber) {
      return Response.json(
        { error: "Missing environment variables." },
        { status: 500 }
      );
    }

    console.log(`Fetching messages from: ${messagesUrl}`);
    const messagesResponse = await fetch(messagesUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const messagesData = await messagesResponse.json();

    if (!messagesResponse.ok) {
      console.error("Error fetching messages:", messagesData);
      return Response.json({ message: "Error fetching messages" }, { status: 500 });
    }

    return Response.json({
      whatsappNumber,
      messages: messagesData,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return Response.json(
      { error: "Unexpected error occurred.", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "User is not signed in." }, { status: 401 });
  }

  const requestingUser = await clerkClient.users.getUser(userId);
  if (!requestingUser.publicMetadata.admin) {
    return Response.json({ error: "User does not have permissions." }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log(body)
    const { conversation_id, message } = body;

    const phoneNumber = conversation_id.split("#")[1]
    // const phoneNumber = phoneNumberMatch[1];

    // Make the POST request to the external Lambda
    const lambdaUrl = process.env.LAMBDA_SEND_MESSAGE
    const lambdaResponse = await fetch(lambdaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phoneNumber,
        reply_message: message,
      }),
    });

    if (!lambdaResponse.ok) {
      const errorText = await lambdaResponse.text();
      return Response.json({ error: "Failed to send message.", details: errorText }, { status: 500 });
    }

    const lambdaData = await lambdaResponse.json();
    return Response.json(lambdaData);
  } catch (error) {
    return Response.json({ error: "Unexpected error occurred.", details: error.message }, { status: 500 });
  }
}
