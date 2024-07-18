'use client'
import { useSearchParams } from "next/navigation"
import TicketCheck from "./ticketcheck"
import { BiAlarmExclamation, BiCheckCircle } from "react-icons/bi";
import { TicketIcon } from '@heroicons/react/24/solid'
import { useEffect, useState } from "react";

export default function ClientForm(props) {
  const {hasCookie, ticket, email } = props
  const [preferences, setPreferences] = useState(false as boolean | string | any[])
  const [messageShown, setMessageShown] = useState(true)
  const params = useSearchParams()
  
  const message = params.get('message')
  const messageType = params.get('messageType')

  const messageClassesBase = "message py-2 pl-4 pr-2 text-white rounded-md flex justify-between items-center transition ease-in-out delay-150 duration-500"
  const messageClassType = messageType =='good' ? 'bg-green-600' : 'bg-red-600'
  const messageIconClasses = "w-6 h-6"
  const messageClassIcon = messageType =='good' ? (<BiCheckCircle className={messageIconClasses}/>) : <BiAlarmExclamation className={messageIconClasses}/>
  const messageClasses = [messageClassesBase,messageClassType].join(' ')

  const courses = [
    { name: "Starter", options: ["Vegan Tart", "Meat on Toast"]},
    { name: "Main", options: ["Pasta", "Meat and Veg"]},
    { name: "Desert", options: ["Fruit Tart", "Gelatine"]},
  ]

  useEffect(() => {
    if(ticket && email) {
        fetch(`http://localhost:3000/api/preferences?email=${email.value}&ticket_number=${ticket.value}`, {
        method: "GET",
      }).then(res => {
        res.json().then(data => {
          data.error ? setPreferences(data.error) : setPreferences(data[0].meal_options)
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
            <fieldset className="my-6">
              <legend className="text-base font-semibold leading-6 text-white">Course</legend>
                <div className="mt-4 divide-y divide-gray-700 border-b border-t border-gray-700">
                  {courses.map((course, courseIdx) => (
                    <div key={courseIdx} className="relative flex items-start py-4">
                      <div className="min-w-0 flex-1 text-sm leading-6">
                        <span className="select-none font-medium text-white">
                          {course.name}
                        </span>
                      </div>
                      <div className="ml-3 flex h-6 items-center gap-5">
                        {course.options.map((option,optionIdx) => {
                          return (
                            <div key={`c${courseIdx}-${optionIdx}`} className="flex items-center gap-2 w-36 justify-end">
                            <label htmlFor={`course-${courseIdx}-${optionIdx}`}>{option}</label>
                            <input
                              id={`course-${courseIdx}-${optionIdx}`}
                              name={`course-${courseIdx}`}
                              type="radio"
                              value={optionIdx}
                              defaultChecked={preferences && preferences[courseIdx] == optionIdx}
                              // checked={preferences[courseIdx] == optionIdx}
                              className="h-4 w-4 rounded-full border-gray-700 text-indigo-600 focus:ring-indigo-600"
                              onChange={() => setPreferences([...preferences.slice(0,courseIdx),optionIdx,...preferences.slice(courseIdx+1)])}
                            />
                            </div>
                          )
                        })}
                        
                      </div>
                    </div>
                  ))}
                </div>
              </fieldset>
              <button className="py-3 px-4 bg-chillired-500 rounded-lg">Save Preferences</button>
            </form>
          ) : preferences ? preferences : (<div>Loading Preferences...</div>) }
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