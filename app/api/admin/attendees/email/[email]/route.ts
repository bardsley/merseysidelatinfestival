import { redirect } from 'next/navigation'
import { NextRequest} from 'next/server'
import { admin_ticketing_url } from '@lib/urls'

export async function GET(_req: NextRequest, { params}: { params: { email: string }}) {
  const requestHeaders = new Headers(_req.headers)  
  const referer = requestHeaders.get('referer')
  console.log("headers", )
  console.log("params", params)
  const apiRequestUrl = `${process.env.LAMBDA_SEND_TICKET_EMAIL}?email=${params.email}`
  console.log("apiRequestUrl", apiRequestUrl)
  const apiResponse = await fetch(apiRequestUrl, { method: 'GET',  headers: { 'Content-Type': 'application/json' }})
  console.log("apiResponse", apiResponse)
  redirect(referer ? referer : admin_ticketing_url)
}