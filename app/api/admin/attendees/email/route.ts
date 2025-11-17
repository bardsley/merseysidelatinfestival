// import { redirect } from 'next/navigation'
import { NextRequest, NextResponse} from 'next/server'
// import { admin_ticketing_url } from '@lib/urls'

export async function POST(request: NextRequest) {
   const res = await request.json()
  // const requestHeaders = new Headers(_req.headers)  
  // const referer = requestHeaders.get('referer')
  // console.log("headers", request.headers)
  console.log("body", res.emails)
  const attempts = res.emails.map(async (email:string) => {
    const apiRequestUrl = `${process.env.LAMBDA_SEND_TICKET_EMAIL}?email=${encodeURIComponent(email)}`
    console.log("apiRequestUrl", apiRequestUrl) 
    return fetch(apiRequestUrl, { method: 'GET',  headers: { 'Content-Type': 'application/json' }})
  })

  const allSent = await Promise.all(attempts)
  // console.log(attempts)
  // const apiRequestUrl = `${process.env.LAMBDA_SEND_TICKET_EMAIL}?email=${encodeURIComponent(params.email)}`
  // console.log("apiRequestUrl", apiRequestUrl)
  // const apiResponse = await fetch(apiRequestUrl, { method: 'GET',  headers: { 'Content-Type': 'application/json' }})
  // console.log("apiResponse", apiResponse)
  // redirect(referer ? referer : admin_ticketing_url)
  return NextResponse.json({ succes: allSent, },{ status: 200, statusText: 'Tickets sent' })
}