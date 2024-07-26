import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function POST(request: Request) {
  const data = await request.formData()
  const ticket = cookies().get('ticket')
  const email = cookies().get('email')
  // console.log(data)
  const courseInfo = Array.from(data.entries()).filter((item)=>{ return /course/.test(item[0]) ? true : false }).map((item)=>{ return parseInt(item[1].toString()) })
  const apiRequestBody = {
    ticket_number: parseInt(ticket.value), //TODO should be a string eventually
    email: email.value,
    preferences: {
      choices: courseInfo,
      dietary_requirements: {
        selected: [data.get('dietary-requirements')],
        other: data.get('other'),
      },
      seating_preference: data.get('seating_preference').toString().split(',')
    }
  }
  console.log("POST -> Conor: ",apiRequestBody)
  const apiResponse = await fetch("https://x4xy6yutqmildatdl3qc53bnzu0bhbdf.lambda-url.eu-west-2.on.aws/", {
    method: 'POST',
    body: JSON.stringify(apiRequestBody)
  })
  const responseData = await apiResponse.json()
  console.log("<- Conor POST",responseData, apiResponse.statusText, apiResponse.status)

  const allGood = apiResponse.ok && !responseData.error
  if(!allGood) { console.error("Error:",responseData.error) }
  const message = allGood ? "Preferences Saved" : "Preferences Not Saved : We are getting the gremlins on it"
  const messageType = allGood ? "good" : "bad"
  redirect(`/preferences?message=${message}&messageType=${messageType}`)
  
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const email = params.get('email') 
  const ticket = params.get('ticket_number')
  const apiRequest = `https://x4xy6yutqmildatdl3qc53bnzu0bhbdf.lambda-url.eu-west-2.on.aws/?requested=meal&email=${email}&ticketnumber=${ticket}`
  // console.log("-> Conor: ",apiRequest)
  const apiResponse = await fetch(apiRequest, { method: 'GET',  headers: { 'Content-Type': 'application/json' }})
  // const data = apiResponse.ok ? await apiResponse.json() : await apiResponse.text()
  const data = await apiResponse.json()
  // console.log("<- Conor",data, apiResponse.statusText, apiResponse.status)
  const responseData = apiResponse.ok ? data[0] : { message: data }
  // console.log("API Response",responseData)
  return  Response.json(responseData)
}
