import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  const data = await request.formData()
  const ticket = cookies().get('ticket')
  const email = cookies().get('email')
  console.log(data,email.value,ticket.value)
  redirect(`/preferences?message=Preferences Saved&messageType=good`)
  
}