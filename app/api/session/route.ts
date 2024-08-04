import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextResponse} from 'next/server'


export async function POST(request: Request) {
  const data = await request.formData()

  const { searchParams } = new URL(request.url)
  const method = searchParams.get('_method')
  console.log("method", method)

  let message: boolean | string = false 
  if(method && method == 'DELETE') {
    cookies().delete('ticket')
    message = 'Logged out'
  } else {
    const ticket = data.get('ticket') ? data.get('ticket').toString() : null
    const email = data.get('email') ? data.get('email').toString() : null
    
    if(ticket && email) {
      cookies().set('ticket', ticket, { secure: true })
      cookies().set('email', email, { secure: true })
    } else {
      const apiRequestUrl = `${process.env.LAMBDA_SEND_TICKET_EMAIL}?email=${email}`
      const apiResponse = await fetch(apiRequestUrl, { method: 'GET',  headers: { 'Content-Type': 'application/json' }})
      console.log("apiResponse", apiResponse)
      message = `An email will be sent to ${email} if this has and tickets associated to it`
    }

  }
  redirect(`/preferences${ message ? `?message=${message}&messageType=good` : ''}`)
  
}

export async function GET() {
  return NextResponse.json({ generated_at: new Date().toISOString() })
}