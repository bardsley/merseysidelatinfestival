import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  const body = await request.json();
  const { attendees, options } = body;

  const apiRequestBody = {
    options: options,
    attendees: attendees,
    }
  console.log("POST -> Connor: ",apiRequestBody)
  const apiResponse = await fetch(process.env.LAMBDA_IMPORT_TICKETS, {
    method: 'POST',
    body: JSON.stringify(apiRequestBody)
  })
  const responseData = await apiResponse.json()
  console.log("<- Connor POST", responseData, apiResponse.statusText, apiResponse.status)

  const allGood = apiResponse.ok && !responseData.error
  if(!allGood) { console.error("Error:",responseData.error) }
  const message = allGood ? "Tickets imported" : "Tickets Not Saved : We are getting the gremlins on it"
  const messageType = allGood ? "good" : "bad"
  redirect(`/admin/import?message=${message}&messageType=${messageType}`)
}