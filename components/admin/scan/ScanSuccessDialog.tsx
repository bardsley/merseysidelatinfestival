import useSWR from "swr";
import { itemsFromPassCombination} from '@components/ticketing/pricingUtilities'
import { format } from "date-fns";
import { fetcher, scanIn } from "@lib/fetchers";
// const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ScanSuccessDialog = ({scan,onClick}) => {
  const {data, error, isLoading, isValidating} = useSWR(`/api/admin/scan/${scan}`, fetcher, { keepPreviousData: false });

  if(scan) {
    if(isLoading) return <div>Loading</div>
    if(error || data.error) return <div>Error: {error} {data?.error}</div>
    if(!data.attendee ) return <div>No Attendee Data?</div>
    if(isValidating) return <div>Validating...</div>

    const attendee = data.attendee
    const goodResult = attendee.active && !attendee.ticket_used
    const student = attendee.student_ticket
    const access = itemsFromPassCombination(attendee.line_items.map(item => item.description))
    const checked_in = attendee.ticket_used ? format(attendee.ticket_used, 'dd MMMM yyyy') : attendee.ticket_used
    const cardColor = isLoading ? "bg-gray-500" : goodResult ? student ? "bg-green-600" : "bg-green-500" : "bg-chillired-600"
    const cancelButton = checked_in ? "border-red-900 text-red-900" : "border-green-900 text-green-900"
    const checkinButton = checked_in ? "bg-red-950" : "bg-green-950"

    return (<div className="absolute top-0 left-0 bg-gradient-to-b from-richblack-500 to-richblack-500 w-full px-3  mb-12">
      <div className={`rounded-xl p-8  w-full flex flex-col justify-between ${cardColor}`}> 
        <div>
          <h1 className="text-2xl md:text-5xl font-bold leading-tight">{attendee.full_name}</h1>
          <h2 className="text-xl md:text-4xl">{attendee.ticket_number}</h2>
          { checked_in ? <div className="text-xl">Checked in already: {checked_in}</div>: <ul className="text-lg list-disc list-inside mt-3">
            {access.map(item => <li key={item}>{item}</li>)}
          </ul>}
        </div>
        <div className="actions flex w-full justify-stretch gap-6 mt-6">
        <button className={`${cancelButton} border  rounded px-4 py-4 w-full text-lg md:text-xl`} onClick={onClick}>Cancel</button>
        <button className={`${checkinButton} rounded px-4 py-4 w-full text-lg md:text-xl`} onClick={() => {scanIn(attendee.ticket_number,attendee.email, checked_in ? true : false); onClick();}}>{checked_in ? "Reset" : "Check in"}</button>
        </div>
      {/* {data ? <pre className="text-xs">Ticket: {JSON.stringify(data,null,2)}</pre> : <div className="text-white text-xl">Loading</div>} */}
      </div>
    </div>)
  } else {
    return <div>Nutting!</div>
  }
  
}

export default ScanSuccessDialog