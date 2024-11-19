'use client'
import useSWR, {mutate} from "swr";
import { useState } from "react";
import { initialSelectedOptions } from "../ticketing/pricingDefaults";
import { format, fromUnixTime } from "date-fns";
import Link from "next/link";
import NameChangeModal from './modals/nameChangeModal';
import TicketTransferModal from './modals/ticketTransferModal';
import { fetcher } from  "@lib/fetchers";
import { guaranteeTimestampFromDate } from "@lib/useful";

const accessToThings = (access:number[],) => {
  let products = []
  let index = 0
  Object.keys(initialSelectedOptions).forEach((day) => {
    Object.keys(initialSelectedOptions[day]).forEach((pass) => {
      if (access[index] === 1) { products.push(`${day} ${pass}`) }
      index += 1
    })
  })
  return products
}

type infoOptions = {
  size?: string,
  grow?: boolean
}
type infoParams = {
  label?: string,
  info: string | string[],
  options?: infoOptions
}
export const Info = ({label,info,options}:infoParams) => {
  const size = options?.size ? options?.size : "xl"
  const grow = options?.grow ? 'flex-grow' : ''
  const displayText = typeof info == 'string' || !info ? info : info.join(', ')
  return (
    <dl className={grow ? "flex-grow basis-1" : ''}>

      { label ? <dt className="text-xs mb-0 text-gray-300">{label}</dt> : null }
      <dd className={`text-${size} leading-tight mb-3`}>{displayText}</dd>
    </dl>
  )
}

export default function TicketView({ticket_number, email}: {ticket_number: string, email: string}) {
  const {data} = useSWR(`/api/ticket/${ticket_number}/${email}`, fetcher)
  const [nameChangeModalActive, setNameChangeModalActive] = useState(false)
  const [ticketTransferModalActive, setTicketTransferModalActive] = useState(false)
  const [activeTicket, setActiveTicket] = useState(null)
  const ticket = data && data[0]

  if(ticket) {
    
    const ticketUsage = ticket.active ? ticket.ticket_used ? `Used @ ${format(ticket.ticket_used,' eee')}` : "Active & Unused" : "Deactivated"
    const purchaseDate = fromUnixTime(guaranteeTimestampFromDate(ticket.purchase_date) / 1000)
    const purchasedThings = ticket.line_items ? ticket.line_items.map((item) => {return `${item.description} £${item.amount_total / 100}`}): []

    return ( data && <div className="w-full md:flex justify-center items-start gap-3 max-w-full">
      { nameChangeModalActive ? <NameChangeModal open={nameChangeModalActive} onClose={(value) => { setNameChangeModalActive(value)}} refreshFunction={()=> mutate(`/api/ticket/${ticket_number}/${email}`)} ticket={activeTicket}/> : null }
      { ticketTransferModalActive ? <TicketTransferModal open={ticketTransferModalActive} onClose={(value) => { setTicketTransferModalActive(value);}} refreshFunction={()=> mutate(`/api/ticket/${ticket_number}/${email}`)} ticket={activeTicket}/> : null }

      <div className="actions flex md:flex-col gap-3 bg-richblack-700 p-3 rounded-md md:order-2 mb-3 ">
        { ticket.active ? <button className="block px-3 py-1 text-sm leading-6  data-[focus]:bg-gray-50 bg-chillired-400 rounded-md"
          onClick={() => { setActiveTicket(ticket); setTicketTransferModalActive(true) }}
        >
          Transfer<span className="sr-only"> {ticket.name}&apos;s ticket</span>
        </button> : <button disabled className='line-through block px-3 py-1 text-sm leading-6 data-[focus]:bg-gray-50 bg-gray-700 text-gray-500 rounded-md disabled:cursor-not-allowed'>Transfer</button>}

        { ticket.active ? (
          <button className="block px-3 py-1 text-sm leading-6 data-[focus]:bg-gray-50 bg-chillired-400 rounded-md"
            onClick={() => { setActiveTicket(ticket); setNameChangeModalActive(true) }}
          >
          Change Name<span className="sr-only"> from {ticket.name}</span>
        </button>) : <button disabled className='line-through block px-3 py-1 text-sm leading-6 data-[focus]:bg-gray-50 bg-gray-700 text-gray-500 rounded-md disabled:cursor-not-allowed'>Change Name</button> }

        { ticket.active ? (<a href={`/api/admin/attendees/email/${ticket.email}`} className="block px-3 py-1 text-sm leading-6 data-[focus]:bg-gray-50 bg-chillired-400 rounded-md">
          Resend Email<span className="sr-only">, {ticket.name}</span>
        </a>) : null }
      </div>

      <div className="cards md:order-1 flex-grow">
        <div className="rounded-lg shadow-lg bg-richblack-600 border-gray-500 border mb-4">
          <h3 className="font-bold uppercase border-b border-gray-500 py-2 px-4">Attendee</h3>
          <div className="p-4">
            <Info label="Name" info={`${ticket.full_name} ${ticket.student_ticket ? "( Student )" : ''}`} options={{size: '3xl'}}/>
            <Info label="Email" info={ticket.email} />
            <Info label="Phone" info={ticket.phone} />
          </div>
          
        </div>

        <div className="rounded-lg shadow-lg bg-richblack-600 border-gray-500 border my-4">
          <h3 className="font-bold uppercase border-b border-gray-500 py-2 px-4">Ticket</h3>
          <div className="p-4 flex justify-between">
            <div>
              <Info label="Ticket" info={ticket_number} options={{size: '3xl'}}/>
              <Info label="Passes" info={accessToThings(ticket.access).join(", ")} options={{size: 'lg'}} />
              <div>{JSON.stringify(ticket.access)}</div>
              <Info label="Usage & Elligibility" info={ticketUsage} />  
            </div>
            <img src={`https://quickchart.io/qr?margin=1&text=${ticket.ticket_number}`} alt={ticket.ticket_number} className="w-40 h-40 aspect-square" />
          </div>
        </div>
        
        <div className="rounded-lg shadow-lg bg-richblack-600 border-gray-500 border my-4">
          <h3 className="font-bold uppercase border-b border-gray-500 py-2 px-4">Purchase</h3>
          <div className="p-4">
            <Info label="Purchased" info={format(purchaseDate,'HH:mm do MMMM yyyy ')} options={{size: 'xl'}}/>
            <Info label="Bought" info={purchasedThings} options={{size: 'lg'}} />
            { ticket.promo_code ? <Info label="Promo Code" info={ticket.promo_code} /> : null }
            <Info label="Payment Method" info={ticket.status.replace('paid_','')} options={{size: '2xl'}} />
            <Info label="Preferences Link" info={`https://www.merseysidelatinfestival.co.uk/preferences?email=${ticket.email.replace("@","%40")}&ticket_number=${ticket.ticket_number}`} options={{size: 'md'}}/>
            <Info label="Upgrade to Meal Link" info={`https://buy.stripe.com/bIY5oq0ZC6zPbFmeV6?client_reference_id=${ticket.ticket_number}`} options={{size: 'md'}}/>
          </div>
        </div>

        {ticket.history || ticket.transferred ? <div className="rounded-lg shadow-lg bg-richblack-600 border-gray-500 border my-4">
          <h3 className="font-bold uppercase border-b border-gray-500 py-2 px-4">History</h3>
          <div className="p-4">
          { ticket.transferred ? <div key={`${ticket.transferred.ticket_number}${ticket.transferred.date}`} className="flex gap-3">
              <Link href={`/admin/ticketing/ticket/${ticket.transferred.ticket_number}/${ticket.transferred.email}`}> <Info label="Direction" info="OUT" options={{size: 'md'}}/></Link>
              <Info label="Transferred" info={format(fromUnixTime(ticket.transferred.date),'HH:mm do MMMM yyyy ')} options={{size: 'md'}}/>
              <Info label="New Name" info={ticket.transferred.full_name} options={{size: 'md'}}/>
              <Info label="New Email" info={ticket.transferred.email} options={{size: 'sm'}}/>
              <Info label="Transfer By" info={ticket.transferred.source} options={{size: 'md'}}/>
            </div> : null}

            { ticket.history && ticket.history.map((record) => {
              const transferred_at = record.date ? typeof record.date == 'string' ? Date.parse(record.date) : fromUnixTime(record.date) : false
              console.log("TD:",record.date)
              return (
                <div key={`${record.ticket_number}${record.date}`} className="flex gap-3 w-full max-w-full justify-between">
                  <Link href={`/admin/ticketing/ticket/${record.ticket_number}/${record.email}`}> <Info label="Direction" info={ticket.ticket_number == record.ticket_number ? "NAME" : "IN"} options={{size: 'md'}}/></Link>
                  <Info label="Transferred " info={transferred_at ? format(transferred_at,'HH:mm do MMM yyyy ') : "None"} options={{size: 'md'}}/>
                  <Info label="Previous Name" info={record.full_name} options={{size: 'md', grow: true}}/>
                  <Info label="Previous Email" info={record.email} options={{size: 'sm', grow: true}}/>
                  <Info label="Transfer By" info={record.source} options={{size: 'md'}}/>
                </div>
              )
            })}
          </div>
        </div> : null }
        
        { process.env.NEXT_PUBLIC_INTERNAL_DEBUG == 'true' && 

        (<>
        <hr/>
        {process.env.NEXT_PUBLIC_INTERNAL_DEBUG}
          <pre>
            {data && JSON.stringify(data,null,2)}
          </pre>
        </>) }
    </div>
    


      
      </div>
    )
  } else {
      return <div>Loading...</div>
  }
  
}