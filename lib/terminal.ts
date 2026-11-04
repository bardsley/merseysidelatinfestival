import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/backend';

export const terminalReaderId = () => process.env.STRIPE_TERMINAL_READER_ID || 'tmr_GuUsxASyJgQoYd';
export const terminalStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY);

export async function requireTillAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error('Please sign in.');
  const user = await createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY }).users.getUser(userId);
  if (!user.publicMetadata.admin) throw new Error('Admin access required.');
  return userId;
}

export async function tillPayment(id: string, userId: string) {
  const intent = await terminalStripe().paymentIntents.retrieve(id);
  if (intent.metadata.source !== 'mlf_till' || intent.metadata.staff !== userId) {
    throw new Error('This payment does not belong to this till session.');
  }
  return intent;
}
