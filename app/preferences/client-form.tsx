'use client'
import { useSearchParams } from "next/navigation"
import TicketCheck from "./ticketcheck"
import { BiAlarmExclamation, BiCheckCircle } from "react-icons/bi";

export default function ClientForm(props) {
  const {hasCookie, ticket, email} = props

  const params = useSearchParams()
  const message = params.get('message')
  const messageType = params.get('messageType')

  const messageClassesBase = "message py-2 pl-4 pr-2 text-white rounded-md flex justify-between items-center"
  const messageClassType = messageType =='good' ? 'bg-green-600' : 'bg-red-600'
  const messageIconClasses = "w-6 h-6"
  const messageClassIcon = messageType =='good' ? (<BiCheckCircle className={messageIconClasses}/>) : <BiAlarmExclamation className={messageIconClasses}/>
  const messageClasses = [messageClassesBase,messageClassType].join(' ')

  if(hasCookie) {
    return (
      <>
        { message ? (<div className={messageClasses}>{message} {messageClassIcon}</div>) : null }

        <div className="flex gap-3 flex-wrap">
          <h1 className="text-xl w-full">
            Meal preferences for ticket
          </h1>
          <div className=" flex justify-between items-end w-full">
            <h1 className="text-4xl">{ticket.value}</h1>
            <form action="/api/session?_method=DELETE" method="POST"><button className=" px-3 py-1 bg-chillired-500 rounded text-xs block">Change Ticket</button></form>
          </div>
        </div>

        <form action="/api/preferences" method="POST" encType="multipart/form-data">
          <button className="py-3 px-4 bg-chillired-500 rounded-lg">Save Preferences</button>
        </form>
        
      </>
    )
  } else {
    return (
      <>
        <p>To set preference please give us the details of the Ticket</p>
        <TicketCheck></TicketCheck>
      </>
    )
  }
  
}