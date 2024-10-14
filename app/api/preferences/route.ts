import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function POST(request: Request) {
  const data = await request.formData()
  const ticket = cookies().get('ticket')
  const email = cookies().get('email')
  console.log(data)
  const courseInfo = Array.from(data.entries()).filter((item)=>{ return /course/.test(item[0]) ? true : false }).map((item)=>{ return parseInt(item[1].toString()) })
  const dietChoices = Array.from(data.entries()).filter((item)=>{ return /selected\[.*\]/.test(item[0]) ? true : false }).map((item)=>{ return item[0].replace('selected[','').replace(']','') })
  console.log("courseInfo", courseInfo)
  console.log("Diet",dietChoices)
  const apiRequestBody = {
    ticket_number: ticket.value.trim(),
    email: email.value.trim(),
    preferences: {
      choices: courseInfo,
      dietary_requirements: {
        selected: [...dietChoices],
        other: data.get('other'),
      },
      seating_preference: data.get('seating_preference') ? data.get('seating_preference').toString().split(',').filter((item)=>{ return item.length > 0}) : [],
    },
    group: { id: data.get('seating_preference'), recommendations: data.get('recommendations')}
  }
  console.log("POST -> Conor: ",apiRequestBody)
  const apiResponse = await fetch(process.env.LAMBDA_PREFERENCES, {
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
  const apiRequest = `${process.env.LAMBDA_PREFERENCES}?requested=preferences&email=${email}&ticketnumber=${ticket}`
  console.log("-> Conor: ",apiRequest)
  const apiResponse = await fetch(apiRequest, { method: 'GET',  headers: { 'Content-Type': 'application/json' }})
  console.log("apiResponse",apiResponse)
  const data = apiResponse.ok ? await apiResponse.json() //TODO this doesn't like empty JSON responses
    : apiResponse.status >= 400 && apiResponse.status < 500 ? await apiResponse.json()
      : { error: `Computer says "${apiResponse.status}:${apiResponse.statusText}"... we'll let someone who understands this know about this` }
  console.log("<- Conor",data, apiResponse.statusText, apiResponse.status)
  const responseData = apiResponse.ok ? data[0] : data
  console.log("API Response",responseData)
  return Response.json(responseData,{status: apiResponse.status})
}
