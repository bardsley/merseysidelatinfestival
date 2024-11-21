import useSWR from "swr";
import {  BiSolidBadgeCheck, BiIdCard} from "react-icons/bi";
// import { itemsFromPassCombination} from '@components/ticketing/pricingUtilities'
import WristBandIcon from '@public/wristband.svg';
import TicketIcon from '@public/ticket.svg';

import { format, fromUnixTime } from "date-fns";
import { fetcher, scanIn } from "@lib/fetchers";

export type line_item = {
  description: string,
}
// fri party, sat class, sat din, sat party, sun class, sun party
//    0           1         2         3         4           5
const accessToWristbands = (accesCode: number[], line_items: line_item[]) => {
  let wristBands = []
  const meal = accesCode[2] > 0
  const friday = accesCode[0] > 0
  
  const artist = line_items.filter((li) => { return /Artist/.test(li.description)}).length > 0
  const staffPass = line_items.filter((li) => { return /Staff/.test(li.description) || /Volunteer/.test(li.description)}).length > 0
  const fullPass = line_items.filter((li) => { return /Full/.test(li.description)}).length > 0
  const fullPassLike = artist || staffPass || fullPass

  const partyPass = line_items.filter((li) => { return /Party\sPass/.test(li.description)}).length > 0 || (accesCode[0] > 0 && accesCode[3] > 0 && accesCode[5] > 0)  && !fullPassLike
  const classPass = line_items.filter((li) => { return /Class\sPass/.test(li.description)}).length > 0 || (accesCode[1] > 0 && accesCode[4] > 0) && !fullPassLike
  const saturdayPass = line_items.filter((li) => { return /Saturday\sPass/.test(li.description) }).length > 0 || (accesCode[1] > 0 && accesCode[3] > 0) && !fullPassLike
  const sundayPass = line_items.filter((li) => { return /Sunday\sPass/.test(li.description) }).length > 0 || (accesCode[4] > 0 && accesCode[5] > 0) && !fullPassLike
  const saturdayClass = line_items.filter((li) => { return /Saturday\s-\sClass/.test(li.description) }).length > 0 || (accesCode[1] > 0 && !saturdayPass && !classPass) && !fullPassLike
  const saturdayParty = line_items.filter((li) => { return /Saturday\s-\sParty/.test(li.description) || /Dine\sand\sDance\sPass/.test(li.description) }).length > 0 || (accesCode[3] > 0 && !saturdayPass && !partyPass) && !fullPassLike
  const sundayClass = line_items.filter((li) => { return /Sunday\s-\sClass/.test(li.description) }).length > 0 || (accesCode[4] > 0 && !sundayPass && !classPass) && !fullPassLike
  const sundayParty = line_items.filter((li) => { return /Sunday\s-\sParty/.test(li.description) }).length > 0 || (accesCode[5] > 0 && !sundayPass && !partyPass) && !fullPassLike

  if(meal) { wristBands.push({ 
    colour: "bg-white text-black", 
    name: "Dinner - Ticket",
    icon: <TicketIcon className="w-8 h-8"/>
  }) }
  if(friday && !artist && !staffPass && !fullPass && !partyPass) { wristBands.push({ 
    colour: "bg-black border border-gray-600", 
    name: "Friday - Stamp",
    icon: <BiSolidBadgeCheck className="w-8 h-8"/>
  }) }
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
  // const wristBandIcon = <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 fill-black" viewBox="0 0 24 24">
  //   <path d="M18 8c0-.909-.613-1.67-1.445-1.912l-1.31-3.443A1 1 0 0 0 14.311 2H8.689a1 1 0 0 0-.934.645l-1.31 3.443A1.996 1.996 0 0 0 5 8v8c0 .909.613 1.67 1.445 1.912l1.31 3.443a1 1 0 0 0 .934.645h5.621c.415 0 .787-.257.935-.645l1.31-3.443A1.996 1.996 0 0 0 18 16v-2h1v-4h-1V8zm-1.998 8H7V8h9l.002 8z"></path>
  //   </svg>
  const defaultWristBandIcon = <WristBandIcon className="w-8 h-8"/>
  if(scan) {
    if(isLoading) return <LoadingDialog onClick={onClick} />
    if(error || data.error) return <div>Error: {error} {data?.error}</div>
    if(!data.attendee ) return <div>No Attendee Data?</div>
    if(isValidating) return <LoadingDialog onClick={onClick} />

    const attendee = data.attendee
    const goodResult = attendee.active && !attendee.ticket_used
    const student = attendee.student_ticket
    const wristBands = accessToWristbands(attendee.access,attendee.line_items)
    // const access = itemsFromPassCombination(attendee.line_items.map(item => item.description))
    const checked_in: string = attendee.ticket_used ? format(fromUnixTime(attendee.ticket_used), 'HH:mm:ss do MMM') : attendee.ticket_used
    const cardColor = isLoading ? "bg-gray-900" : goodResult ? student ? "bg-green-900" : "bg-green-900" : "bg-chillired-800"
    const cancelButton = checked_in ? "border-red-900 text-red-900" : "border-green-200 text-green-100 hover:text-white"
    const checkinButton = checked_in ? "bg-red-600" : "bg-green-600 hover:bg-green-500"

    return (<div className="fixed top-0 left-0 w-full h-full bg-black/80 flex items-center justify-center px-3 mb-12">
      <div className={`rounded-xl w-full flex flex-col max-w-128 justify-between ${cardColor}`}> 
        <div className="p-4">  
          <h1 className="text-2xl md:text-5xl font-bold leading-none break-words">{attendee.full_name}</h1>
          <h2 className="text-lg md:text-2xl">{attendee.ticket_number}</h2>
        </div>
        <div className="-mx-1">
        { checked_in ? <div className="bg-chillired-300 text-xl flex flex-col justify-center items-center rounded w-full p-4 mb-2">
              <p className="leading-0">ALREADY CHECKED IN:</p>
              <p>{checked_in.toUpperCase()}</p>
            </div>
            : <div>
              { wristBands.map((wristBand) => {
                return (<div key={wristBand.name} className={`${wristBand.colour} flex justify-start items-center gap-4 rounded w-full text-lg p-4 mb-2`}>
                  {wristBand.icon? wristBand.icon : defaultWristBandIcon}
                  {wristBand.name}
                </div>)
              })}
            </div>
          }
        </div>
        <div>
        {student && goodResult ? <div className="bg-yellow-400 flex gap-2 items-center justify-center py-1 mx-4 mt-3 text-xl text-black"> 
          <BiIdCard className="w-8 h-8"/>Check Student ID</div> : null}
        </div>
        <div className="actions flex justify-stretch gap-6 mt-6 mb-4 mx-4">
          
        <button className={`${cancelButton} border  rounded px-4 py-4 w-full text-lg md:text-xl`} onClick={onClick}>Cancel</button>
        <button className={`${checkinButton} rounded px-4 py-4 w-full text-lg md:text-xl`} onClick={() => {scanIn(attendee.ticket_number,attendee.email, checked_in ? true : false); onClick();}}>{checked_in ? "Reset" : "Check in"}</button>
        </div>
      {/* {data ? <pre className="text-xs">Ticket: {JSON.stringify(data,null,2)}</pre> : <div className="text-white text-xl">Loading</div>} */}
      </div>
    </div>)
  } else {
    return <LoadingDialog onClick={onClick} />
  }
  
}

const LoadingDialog = ({onClick}) => {
  return <div className="fixed top-0 left-0 w-full h-full bg-black/80 p-2 flex justify-center items-center" onClick={onClick}>
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-75" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
</div>
}

export default ScanSuccessDialog

