'use client'
import { useSearchParams } from "next/navigation"
import TicketCheck from "./ticketcheck"
import { BiAlarmExclamation, BiCheckCircle } from "react-icons/bi";
import { TicketIcon } from '@heroicons/react/24/solid'
import { useEffect, useState } from "react";
import MealPreferences, { blankPreferences } from "../../components/preferences/MealPreferences"

export default function ClientPreferencesForm(props) {
  const {hasCookie, ticket, email } = props
  const [preferences, setPreferences] = useState(false as boolean | string | any)
  const [error, setError] = useState(false as boolean | string)
  const [messageShown, setMessageShown] = useState(true)
  const params = useSearchParams()
  
  const message = params.get('message') || error
  const messageType = params.get('messageType') ? params.get('messageType') : error ? 'bad' : 'good'
  const preFilledEmail = params.get('email') 
  const preFilledTicketNumber = params.get('ticket_number')

  const messageClassesBase = "message py-2 pl-4 pr-2 text-white rounded-md flex justify-between items-center transition ease-in-out delay-150 duration-500"
  const messageClassType = messageType =='good' ? 'bg-green-600' : 'bg-red-600'
  const messageIconClasses = "w-6 h-6"
  const messageClassIcon = messageType =='good' ? (<BiCheckCircle className={messageIconClasses}/>) : <BiAlarmExclamation className={messageIconClasses}/>
  const messageClasses = [messageClassesBase,messageClassType].join(' ')



  useEffect(() => {
    if(ticket && email) {
        const fetchURL = `//${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}/api/preferences?email=${email.value}&ticket_number=${ticket.value}`
        fetch(fetchURL, {method: "GET",}).then(res => {
        res.json().then(data => {
          data.error ? setError(data.error) : data.preferences ? setPreferences(data.preferences) : setPreferences(blankPreferences)
        })
      })
    }
    if(message && messageType == 'good') {
      setTimeout(() => {
        setMessageShown(false) 
      }, 3000)
    }
  }, [])

  if(hasCookie) {
      return (
        <>
          { message ? (<div className={messageClasses + (messageShown ? "" : " opacity-0")} onClick={() => setMessageShown(false)}>{message} {messageClassIcon}</div>) : null }

          <div className="flex gap-3 flex-wrap">
            <h1 className="text-xl w-full">
              Meal preferences for ticket
            </h1>
            <div className=" flex justify-between items-end w-full">
              <h1 className="text-4xl flex items-center gap-6"><TicketIcon className="w-12 h-12"/>{ticket.value}</h1>
              <form action="/api/session?_method=DELETE" method="POST"><button className=" px-3 py-1 bg-chillired-500 rounded text-xs block">Change Ticket</button></form>
            </div>
          </div>
          {/* {JSON.stringify(preferences)} */}
          {preferences && typeof preferences === 'object' ? (
            <form action="/api/preferences" method="POST" encType="multipart/form-data">
            <MealPreferences preferences={preferences} setPreferences={setPreferences}></MealPreferences>
              <button className="py-3 px-4 bg-chillired-500 rounded-lg">Save Preferences</button>
            </form>
          ) : preferences ? preferences : (<div className="m-2 ">Loading Preferences...</div>) }
        </>
      )
  } else {
    return (
      <>
        <p>To set preferences please give us the details of the Ticket</p>
        <TicketCheck email={preFilledEmail} ticket_number={preFilledTicketNumber}></TicketCheck>
      </>
    )
  }
  
}