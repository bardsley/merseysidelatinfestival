const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // const price_id = "price_1PZdG3EWkmdeWsQPrtrfrxtL"
  const data = await request.json()
  const lineItems1 = data.map((priceId)=>{
    return {
      price: priceId,
      quantity: 1
    }
  })
  const lineItems2 = [
      {
        // Provide the exact Price ID (for example, pr_1234) of
        // the product you want to sell
        price: 'price_1PZdG3EWkmdeWsQPrtrfrxtL',
        quantity: 1,
      },
    ]
  console.log("lineItems:",lineItems1, lineItems2)

  try {
    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: lineItems1,
      mode: 'payment',
      return_url:
        `${request.headers.get("origin")}/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    return NextResponse.json({clientSecret: session.client_secret});
  } catch (err) {
    return NextResponse.json(err.message, {status: err.statusCode || 500});
  }
}

export async function GET(request: NextRequest, { params }: { params: { session_id: string } }) {
  try {
    const session =
      await stripe.checkout.sessions.retrieve(params.session_id);

    return NextResponse.json({
      status: session.status,
      customer_email: session.customer_details.email
    });
  } catch (err) {
    return NextResponse.json( err.message, {status: err.statusCode || 500});
  }
}
// export default async function handler(req, res) {
//   switch (req.method) {
//     case "POST":
//       try {
//         // Create Checkout Sessions from body params.
//         const session = await stripe.checkout.sessions.create({
//           ui_mode: 'embedded',
//           line_items: [
//             {
//               // Provide the exact Price ID (for example, pr_1234) of
//               // the product you want to sell
//               price: '{{PRICE_ID}}',
//               quantity: 1,
//             },
//           ],
//           mode: 'payment',
//           return_url:
//             `${req.headers.origin}/return?session_id={CHECKOUT_SESSION_ID}`,
//         });

//         res.send({clientSecret: session.client_secret});
//       } catch (err) {
//         res.status(err.statusCode || 500).json(err.message);
//       }
//       break;
//     case "GET":
//       try {
//         const session =
//           await stripe.checkout.sessions.retrieve(req.query.session_id);

//         res.send({
//           status: session.status,
//           customer_email: session.customer_details.email
//         });
//       } catch (err) {
//         res.status(err.statusCode || 500).json(err.message);
//       }
//       break;
//     default:
//       res.setHeader('Allow', req.method);
//       res.status(405).end('Method Not Allowed');
//   }
// }

