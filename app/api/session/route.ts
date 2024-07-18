import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'


export async function POST(request: Request) {
  const data = await request.formData()
  const newHttpMethod = request.headers.get('x-new-method')
  let message: boolean | string = false 
  if(newHttpMethod && newHttpMethod != 'NOCHANGE') {
    cookies().delete('ticket')
    message = 'logged out'
  } else {
    const ticket = data.get('ticket').toString()
    const email = data.get('email').toString()

    if(ticket) {
      cookies().set('ticket', ticket, { secure: true })
      cookies().set('email', email, { secure: true })
      
    } 
  }
  redirect(`/preferences${ message ? `?message=${message}` : ''}`)
  
}