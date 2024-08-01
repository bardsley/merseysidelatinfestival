import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextResponse} from 'next/server'


export async function POST(request: Request) {
  const data = await request.formData()
  const newHttpMethod = request.headers.get('x-new-method')
  let message: boolean | string = false 
  if(newHttpMethod && newHttpMethod != 'NOCHANGE') {
    cookies().delete('ticket')
    message = 'Logged out'
  } else {
    const ticket = data.get('ticket').toString()
    const email = data.get('email').toString()

    if(ticket) {
      cookies().set('ticket', ticket, { secure: true })
      cookies().set('email', email, { secure: true })
    } else {
      const apiRequestUrl = `${process.env.LAMBDA_CHECK_EMAIL_TICKET_COMBO}?email=${email}`
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