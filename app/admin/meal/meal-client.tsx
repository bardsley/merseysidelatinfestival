'use client'
import React, { useState } from "react";
import useSWR from 'swr';
import { fetcher } from  "@lib/fetchers";
const mealSummaryApiUrl = "/api/admin/meal/summary"

export default function DiningPageClient() {
  const [status,setStatus] = useState({} as any)
  const {data: summaryData, error: summaryError, isLoading: summaryLoading, isValidating: summaryValidating} = useSWR(mealSummaryApiUrl, fetcher, { keepPreviousData: false });

  const attendees = summaryData && summaryData.meal_attendees_list

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/admin/meal/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })
    console.log(response)
    setStatus(response.ok ? {success: true,  message: "Emails Triggered"} : { success: false, message: "Error" })
  }

  return <div>
      <div className="mb-6 overflow-hidden pt-3 ">
        {JSON.stringify(status) == "{}" ? null : <p className={`w-full p-3 rounded-lg ${status.success ? "bg-green-800": "bg-red-600"}`}>{status.message}</p> }
        <button onClick={handleSubmit} className="py-3 px-6 mt-3 float-right bg-chillired-500 rounded-lg block">Trigger Meal Reminder</button>
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
      <h1>Attendees with dinner</h1>
      {summaryValidating ? 
          <div role="status" className='flex'>
            <svg aria-hidden="true" className="w-4 h-4 me-2 text-gray-200 animate-spin dark:text-gray-600 fill-chillired-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
            <span className="">Refreshing...</span>
      </div> : null}

      <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-100 sm:pl-0">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-100">
                      Group
                    </th>                    
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-100">
                      Pass Type
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-100">
                      Choices
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-100">
                      Table
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                      <span className="sr-only">Action </span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {summaryLoading || summaryError ? <p>Loading..</p> : attendees.map((attendee, index) => {
                    const baseClasses = "whitespace-nowrap px-1 py-3 text-xs text-gray-100 "

                    return (<tr key={index} className={`${attendee.not_wanted ? 'decoration-1	 line-through text-gray-600' : ''} ${attendee.is_selected ? '' : 'bg-yellow-900/20'}`}>
                      <td className={baseClasses}>{attendee.full_name}</td>
                      <td className={baseClasses}>{attendee.group}</td>
                      <td className={baseClasses}>{attendee.pass_type}</td>
                      <td className={baseClasses}>{attendee.is_selected ? attendee.choices : " "}</td>
                      <td className={baseClasses}>{attendee.assigned_table}</td>
                    </tr>)
                    
                  })}
                </tbody>
              </table>
            </div>
          </div>
       </div>      
    </div>
    </div>
}
