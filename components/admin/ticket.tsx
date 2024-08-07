'use client'
import useSWR from "swr";
import { initialSelectedOptions } from "../ticketing/pricingDefaults";
import { format, fromUnixTime } from "date-fns";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
}
type infoParams = {
  label?: string,
  info: string | string[],
  options?: infoOptions
}
export const Info = ({label,info,options}:infoParams) => {
  const size = options?.size ? options?.size : "xl"
  const displayText = typeof info == 'string' || !info ? info : info.join(', ')
  return (
    <dl>
      { label ? <dt className="text-xs mb-0 text-gray-300">{label}</dt> : null }
      <dd className={`text-${size} leading-tight mb-3`}>{displayText}</dd>
    </dl>
  )
}

export default function TicketView({ticket_number, email}: {ticket_number: string, email: string}) {
  const {data} = useSWR(`/api/ticket/${ticket_number}/${email}`, fetcher)
  const ticket = data && data[0]

  if(ticket) {
    
    const ticketUsage = ticket.active ? ticket.ticket_used ? `Used @ ${format(ticket.ticket_used,' eee')}` : "Active & Unused" : "Deactivated"
    const purchaseData = fromUnixTime(ticket.purchase_date)
    const purchasedThings = ticket.line_items ? ticket.line_items.map((item) => {return `${item.description} £${item.amount_total / 100}`}): []

    return ( data && <div>
      
      <div className="rounded-lg shadow-lg bg-richblack-600 border-gray-500 border my-4">
        <h3 className="font-bold uppercase border-b border-gray-500 py-2 px-4">Attendee</h3>
        <div className="p-4">
          <Info label="Name" info={`${ticket.full_name} ${ticket.student_ticket ? "( Student )" : ''}`} options={{size: '3xl'}}/>
          <Info label="Email" info={ticket.email} />
          <Info label="Phone" info={ticket.phone} />
        </div>
        
      </div>

      <div className="rounded-lg shadow-lg bg-richblack-600 border-gray-500 border my-4">
        <h3 className="font-bold uppercase border-b border-gray-500 py-2 px-4">Ticket</h3>
        <div className="p-4">
          <Info label="Ticket" info={ticket_number} options={{size: '3xl'}}/>
          <Info label="Passes" info={accessToThings(ticket.access).join(", ")} options={{size: 'lg'}} />
          <Info label="Usage & Elligibility" info={ticketUsage} />  
        </div>
      </div>
      
      <div className="rounded-lg shadow-lg bg-richblack-600 border-gray-500 border my-4">
        <h3 className="font-bold uppercase border-b border-gray-500 py-2 px-4">Purchase</h3>
        <div className="p-4">
          <Info label="Purchased" info={format(purchaseData,'HH:mm do MMMM yyyy ')} options={{size: 'xl'}}/>
          <Info label="Bought" info={purchasedThings} options={{size: 'lg'}} />
          { ticket.promo_code ? <Info label="Promo Code" info={ticket.promo_code} /> : null }
          <Info label="Payment Method" info={ticket.status.replace('paid_','')} options={{size: '2xl'}} />
        </div>
      </div>

      {ticket.history || ticket.transferred ? <div className="rounded-lg shadow-lg bg-richblack-600 border-gray-500 border my-4">
        <h3 className="font-bold uppercase border-b border-gray-500 py-2 px-4">History</h3>
        <div className="p-4">
         { ticket.transferred ? <div key={ticket.transferred.ticket_number} className="flex gap-3">
            <Link href={`/admin/ticketing/ticket/${ticket.transferred.ticket_number}/${ticket.transferred.email}`}> <Info label="Direction" info="OUT" options={{size: 'md'}}/></Link>
            <Info label="Transferred" info={format(fromUnixTime(ticket.transferred.date),'HH:mm do MMMM yyyy ')} options={{size: 'md'}}/>
            <Info label="New Name" info={ticket.transferred.full_name} options={{size: 'md'}}/>
            <Info label="New Email" info={ticket.transferred.email} options={{size: 'md'}}/>
            <Info label="Transfer By" info={ticket.transferred.source} options={{size: 'md'}}/>
          </div> : null}

          { ticket.history && ticket.history.map((record) => {
            return (
              <div key={record.ticket_number} className="flex gap-3">
                <Link href={`/admin/ticketing/ticket/${record.ticket_number}/${record.email}`}> <Info label="Direction" info={ticket.ticket_number == record.ticket_number ? "NAME" : "IN"} options={{size: 'md'}}/></Link>
                <Info label="Transferred " info={format(fromUnixTime(record.date),'HH:mm do MMM yyyy ')} options={{size: 'md'}}/>
                <Info label="Previous Name" info={record.full_name} options={{size: 'md'}}/>
                <Info label="Previous Email" info={record.email} options={{size: 'md'}}/>
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
    )
  } else {
      return <div>Loading...</div>
  }
  
}