import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'


export async function POST(request: Request) {
  const data = await request.formData()
  const ticket = data.get('ticket').toString()
  console.log("DATA:",data)
  if(ticket) {
    cookies().set('ticket', ticket, { secure: true })
  } 
  redirect('/attendee')
}

export async function DELETE(request: Request) {
  cookies().delete('ticket')
  redirect('/attendee?message=logged%20;out')
}