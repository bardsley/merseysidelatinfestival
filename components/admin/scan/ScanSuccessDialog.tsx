import useSWR from "swr";
import { itemsFromPassCombination} from '@components/ticketing/pricingUtilities'
import { format, fromUnixTime } from "date-fns";
import { fetcher, scanIn } from "@lib/fetchers";

export type line_item = {
  description: string,
}
const accessToWristbands = (accesCode: number[], line_items: line_item[]) => {
  let wristBands = []
  const meal = accesCode[2] > 0
  const friday = accesCode[0] > 0
  const artist = line_items.filter((li) => { return /Artist/.test(li.description)}).length > 0
  const staffPass = line_items.filter((li) => { return /Staff/.test(li.description) || /Volunteer/.test(li.description)}).length > 0
  const fullPass = line_items.filter((li) => { return /Full/.test(li.description)}).length > 0
  const partyPass = line_items.filter((li) => { return /Party\sPass/.test(li.description)}).length > 0
  const classPass = line_items.filter((li) => { return /Class\sPass/.test(li.description)}).length > 0
  const saturdayPass = line_items.filter((li) => { return /Saturday\sPass/.test(li.description) }).length > 0
  const sundayPass = line_items.filter((li) => { return /Sunday\sPass/.test(li.description) }).length > 0
  const saturdayClass = line_items.filter((li) => { return /Saturday\s\-\sClass/.test(li.description) }).length > 0
  const saturdayParty = line_items.filter((li) => { return /Saturday\s\-\sParty/.test(li.description) || /Dine\sand\sDance\sPass/.test(li.description) }).length > 0
  const sundayClass = line_items.filter((li) => { return /Sunday\s\-\sClass/.test(li.description) }).length > 0
  const sundayParty = line_items.filter((li) => { return /Sunday\s\-\sParty/.test(li.description) }).length > 0


  if(meal) { wristBands.push({ colour: "bg-white text-black", name: "Dinner - Ticket"}) }
  if(friday && !artist && !staffPass && !fullPass && !partyPass) { wristBands.push({ colour: "bg-black", name: "Friday - Stamp"}) }
  if(artist) { wristBands.push({ colour: "bg-blue-600", name: "Artist Pass - Plastic"}) }
  if(staffPass) { wristBands.push({ colour: "bg-blue-600", name: "Staff/Volunteer Pass - Plastic"}) }
  if(fullPass) { wristBands.push({ colour: "bg-gray-300 text-black", name: "Full Pass - Plastic"}) }
  if(partyPass) { wristBands.push({ colour: "bg-orange-700", name: "Party Pass - Plastic"}) }
  if(classPass) { wristBands.push({ colour: "bg-orange-400 text-black", name: "Class Pass - Paper"}) }
  if(saturdayPass) { wristBands.push({ colour: "bg-purple-700", name: "Saturday Pass - Plastic"}) }
  if(sundayPass) { wristBands.push({ colour: "bg-yellow-300 text-black", name: "Sunday Pass - Paper"}) }
  if(saturdayClass) { wristBands.push({ colour: "bg-pink-400 text-black", name: "Saturday Class - Paper"}) }
  if(saturdayParty) { wristBands.push({ colour: "bg-green-950", name: "Saturday Party - Paper"}) }
  if(sundayClass) { wristBands.push({ colour: "bg-green-400", name: "Sunday Class - Plastic"}) }
  if(sundayParty) { wristBands.push({ colour: "bg-blue-800", name: "Sunday Party - Paper"}) }
  return wristBands
}

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
    const wristBands = accessToWristbands(attendee.access,attendee.line_items)
    const access = itemsFromPassCombination(attendee.line_items.map(item => item.description))
    const checked_in = attendee.ticket_used ? format(fromUnixTime(attendee.ticket_used), 'HH:mm:ss do MMM') : attendee.ticket_used
    const cardColor = isLoading ? "bg-gray-500" : goodResult ? student ? "bg-green-600" : "bg-green-500" : "bg-chillired-600"
    const cancelButton = checked_in ? "border-red-900 text-red-900" : "border-green-900 text-green-900"
    const checkinButton = checked_in ? "bg-red-950" : "bg-green-950"

    return (<div className="absolute top-0 left-0 bg-gradient-to-b from-richblack-500 to-richblack-500 w-full px-3  mb-12">
      <div className={`rounded-xl p-4  w-full flex flex-col justify-between ${cardColor}`}> 
        <div className="p-4">  
          <h1 className="text-2xl md:text-5xl font-bold leading-tight">{attendee.full_name}</h1>
          <h2 className="text-lg md:text-2xl">{attendee.ticket_number}</h2>
          { checked_in ? <div className="text-xl">Checked in already: {checked_in}</div>: <div>
              {/* <ul className="text-lg list-disc list-inside mt-3">
                {access.map(item => <li className="text-sm" key={item}>{item}</li>)}
              </ul> */}
              { wristBands.map((wristBand) => {
                return (<div key={wristBand.name} className={`${wristBand.colour} rounded w-full p-2`}>{wristBand.name}</div>)
              })}
            </div>
          }
          
        </div>
        <div className="actions flex w-full justify-stretch gap-6 mt-6">
          {student ? <div className="">Student Ticket Check ID</div> : null}
        <button className={`${cancelButton} border  rounded px-4 py-4 w-full text-lg md:text-xl`} onClick={onClick}>Cancel</button>
        <button className={`${checkinButton} rounded px-4 py-4 w-full text-lg md:text-xl`} onClick={() => {scanIn(attendee.ticket_number,attendee.email, checked_in ? true : false); onClick();}}>{checked_in ? "Reset" : "Check in"}</button>
        </div>
      {/* {data ? <pre className="text-xs">Ticket: {JSON.stringify(data,null,2)}</pre> : <div className="text-white text-xl">Loading</div>} */}
      </div>
    </div>)
  } else {
    return <div>Nothing</div>
  }
  
}

export default ScanSuccessDialog

