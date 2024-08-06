'use client'
import { useRouter } from 'next/navigation'

export default async function TicketView() {
  const router = useRouter()

  return ( <div>
    <h2>Hello</h2>
    {router. .ticket_number}
    </div>
  )
}