import { NextResponse } from 'next/server';
import { requireTillAdmin, terminalReaderId, terminalStripe, tillPayment } from '@lib/terminal';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const userId = await requireTillAdmin();
    const body = await request.json();
    const stripe = terminalStripe();
    if (body.action === 'cancel_reader' || body.action === 'cancel_reader_payment') {
      const reader = await stripe.terminal.readers.retrieve(terminalReaderId());
      if (!('device_type' in reader)) throw new Error('The configured reader has been deleted.');
      if (JSON.stringify(reader.action) !== body.expectedAction) {
        return NextResponse.json({ error: 'The reader action changed. Refresh and review it before canceling.' }, { status: 409 });
      }
      const id = reader.action?.process_payment_intent?.payment_intent;
      const intent = body.action === 'cancel_reader_payment' && id ? await stripe.paymentIntents.retrieve(typeof id === 'string' ? id : id.id) : null;
      if (body.action === 'cancel_reader_payment' && (!intent || intent.metadata.source !== 'mlf_till')) {
        throw new Error('Only an MLF till payment attached to this reader can be canceled here.');
      }
      if (intent?.status === 'succeeded') throw new Error('This payment has already succeeded. It cannot be canceled here.');
      if (reader.action?.status === 'in_progress') await stripe.terminal.readers.cancelAction(reader.id);
      if (intent && intent.status !== 'canceled') await stripe.paymentIntents.cancel(intent.id);
      return NextResponse.json({ ok: true, message: 'Reader action released. This does not refund or cancel a captured payment.' });
    }
    if (body.action === 'simulate') {
      const intent = await tillPayment(body.paymentIntentId, userId);
      const reader = await stripe.terminal.readers.retrieve(terminalReaderId());
      if (!('device_type' in reader)) throw new Error('The configured reader has been deleted.');
      if (reader.livemode || !reader.device_type.startsWith('simulated_') || reader.action?.process_payment_intent?.payment_intent !== intent.id) {
        throw new Error('Simulation is only available for the active payment on a simulated reader.');
      }
      await stripe.testHelpers.terminal.readers.presentPaymentMethod(reader.id);
      return NextResponse.json({ ok: true });
    }
    let intent;
    if (body.paymentIntentId) {
      intent = await tillPayment(body.paymentIntentId, userId);
    } else {
      if (!Number.isSafeInteger(body.amount) || body.amount <= 0 || typeof body.attemptId !== 'string') {
        return NextResponse.json({ error: 'A valid amount and payment attempt are required.' }, { status: 400 });
      }
      intent = await stripe.paymentIntents.create({
        amount: body.amount, currency: 'gbp', payment_method_types: ['card_present'], capture_method: 'automatic',
        metadata: { source: 'mlf_till', staff: userId },
      }, { idempotencyKey: `mlf-till-${userId}-${body.attemptId}` });
    }
    if (intent.status === 'requires_payment_method') {
      try {
        const reader = await stripe.terminal.readers.retrieve(terminalReaderId());
        if (!('device_type' in reader)) throw new Error('The configured reader has been deleted.');
        if (reader.action?.status !== 'in_progress') {
          await stripe.terminal.readers.processPaymentIntent(reader.id, { payment_intent: intent.id });
        } else if (reader.action?.process_payment_intent?.payment_intent !== intent.id) {
          throw new Error('The reader is busy with another payment.');
        }
      } catch (error) {
        return NextResponse.json({ paymentIntentId: intent.id, error: error.message }, { status: 409 });
      }
    }
    return NextResponse.json({ paymentIntentId: intent.id, status: intent.status });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to start payment.' }, { status: 400 });
  }
}

export async function GET(request: Request) {
  try {
    const userId = await requireTillAdmin();
    const paymentIntentId = new URL(request.url).searchParams.get('paymentIntentId');
    const reader = await terminalStripe().terminal.readers.retrieve(terminalReaderId());
    if (!('device_type' in reader)) throw new Error('The configured reader has been deleted.');
    if (new URL(request.url).searchParams.get('debug') === 'true') {
      const id = reader.action?.process_payment_intent?.payment_intent;
      const intent = id ? await terminalStripe().paymentIntents.retrieve(typeof id === 'string' ? id : id.id) : null;
      return NextResponse.json({
        checkedAt: new Date().toISOString(),
        reader: { id: reader.id, label: reader.label, status: reader.status, deviceType: reader.device_type,
          livemode: reader.livemode, action: reader.action },
        payment: intent ? { id: intent.id, status: intent.status, amount: intent.amount,
          amountReceived: intent.amount_received, currency: intent.currency,
          source: intent.metadata.source || null, lastError: intent.last_payment_error?.message || null } : null,
        simulated: !reader.livemode && reader.device_type.startsWith('simulated_'),
      });
    }
    const simulated = !reader.livemode && reader.device_type.startsWith('simulated_');
    if (!paymentIntentId) return NextResponse.json({ simulated });
    const intent = await tillPayment(paymentIntentId, userId);
    const action = reader.action?.process_payment_intent?.payment_intent === intent.id ? reader.action : null;
    return NextResponse.json({ status: intent.status, failure: action?.status === 'failed' ? action.failure_message : null,
      simulated: !reader.livemode && reader.device_type.startsWith('simulated_') });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to check payment.' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await requireTillAdmin();
    const { paymentIntentId } = await request.json();
    const intent = await tillPayment(paymentIntentId, userId);
    const stripe = terminalStripe();
    const reader = await stripe.terminal.readers.retrieve(terminalReaderId());
    if (!('device_type' in reader)) throw new Error('The configured reader has been deleted.');
    if (reader.action?.status === 'in_progress' && reader.action?.process_payment_intent?.payment_intent === intent.id) {
      await stripe.terminal.readers.cancelAction(reader.id);
    }
    // Cancellation must succeed before the till can accept another payment.
    const canceled = await stripe.paymentIntents.cancel(intent.id);
    return NextResponse.json({ status: canceled.status });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to cancel payment. Check payment status before continuing.' }, { status: 400 });
  }
}
