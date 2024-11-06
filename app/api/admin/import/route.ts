import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  const body = await request.json();
  const { attendees, options } = body;

  const apiRequestBody = {
    options: options,
    attendees: attendees,
    }
  console.log("POST -> Connor: ",apiRequestBody)
  console.log("API", process.env.LAMBDA_IMPORT_TICKETS)
  const apiResponse = await fetch(process.env.LAMBDA_IMPORT_TICKETS, {
    method: 'POST',
    body: JSON.stringify(apiRequestBody)
  })
  const responseData = await apiResponse.json()
  console.log("<- Connor POST", responseData, apiResponse.statusText, apiResponse.status)

  let message = ''

  const allGood = apiResponse.ok && !responseData.error
  if(!allGood) { console.error("Error:",responseData.error) }
  message = allGood ? "Tickets imported" : "Tickets Not Saved : We are getting the gremlins on it"
  const messageType = allGood ? "good" : "bad"

  if (apiResponse.status === 207){
    message = "Partial success: some attendees were not imported"
    console.log(responseData.failed_imports)
  }
  return new Response(
    JSON.stringify({
      message: message, 
      type: messageType,
      failed_imports: apiResponse.status === 207 ? responseData.failed_imports : [],
    }),
    {
      status: apiResponse.status,
      headers: {'Content-Type': 'application/json',}
    }
  )
}