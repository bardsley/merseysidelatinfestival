import { NextResponse} from 'next/server'
import  Pusher from 'pusher'

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: "eu",
  useTLS: true
});


export async function POST(request: Request) {
  const body = await request.json()
  const eventName = body.eventName
  const payload = JSON.parse(body.payload)
  console.log(eventName)
  console.log(payload)
  console.log(JSON.stringify(JSON.stringify(payload)))

  if(eventName == 'TestMessage') {
    return NextResponse.json({ generated_at: new Date().toISOString() })
  } else {
    // console.log("request:", request)
    // console.log("body:",body)
    // console.log("payload:",payload, payload.products.map((product) => product.category))
    const channel = "card-payments"

    const tills = payload.products.map((product) => product?.sku || "notill" ) as string[]
    const notification = {
      amount: payload.amount,
      created: payload.created,
      timestamp: payload.timestamp,
      payment_ref: payload.payments.map((payment) => payment?.attributes?.reference).join(' , '),
      purchaseUuid: payload.purchaseUuid,
      tills: tills
    //   products: payload.products.map((product) => { return { name: product.sku , till: product?.category?.name?.toLowerCase()?.replaceAll(" ", ""),  Uuid: product['productUuid'] }} ) as string[],
    }
    console.log("notification:",notification)
    
    tills.forEach(till => {
      pusher.trigger(channel, till, notification);
    })
    pusher.trigger(channel, "all", notification);
    return NextResponse.json({ generated_at: new Date().toISOString() })
  }
}