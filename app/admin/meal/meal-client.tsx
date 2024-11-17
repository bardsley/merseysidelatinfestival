'use client'
import React, { useState } from "react";
import useSWR from 'swr';
import { fetcher } from  "@lib/fetchers";
import AttendeesMealTable from "@components/admin/attendeeMealTable";
import { ArrowRightIcon } from '@heroicons/react/24/solid'; 
import MealTableSorter from "@components/mealTableSorter";
const mealSummaryApiUrl = "/api/admin/meal/summary"

export default function DiningPageClient() {
  const [status,setStatus] = useState({} as any)
  const [isAttendeesCollapsed, setIsAttendeesCollapsed] = useState(true);
  const [isSorterCollapsed, setIsSorterCollapsed] = useState(true);

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
        <div
          className={`flex justify-between items-center bg-richblack-700 text-white px-4 py-3 ${isAttendeesCollapsed ? "rounded-md": "rounded-t-md"} cursor-pointer`}
          onClick={() => setIsAttendeesCollapsed(!isAttendeesCollapsed)}>
          <h1 className="text-xl font-bold">Attendees with Dinner</h1>
          <span className={`transform transition-transform ${isAttendeesCollapsed ? '' : 'rotate-90'}`}><ArrowRightIcon className="w-4 h-4"/></span>
        </div>
        {!isAttendeesCollapsed && (
          <AttendeesMealTable attendees={attendees} summaryLoading={summaryLoading} summaryIsValidating={summaryValidating} summaryError={summaryError} />
        )}
      </div>
      <br />
      <div className="px-4 sm:px-6 lg:px-8">
        <div
          className={`flex justify-between items-center bg-richblack-700 text-white px-4 py-3 ${isSorterCollapsed ? "rounded-md" : "rounded-t-md"} cursor-pointer`}
          onClick={() => setIsSorterCollapsed(!isSorterCollapsed)}>
          <h1 className="text-xl font-bold">Assign attendees to tables</h1>
          <span className={`transform transition-transform ${isSorterCollapsed ? '' : 'rotate-90'}`}><ArrowRightIcon className="w-4 h-4"/></span>         
        </div>
        {!isSorterCollapsed && (
          <MealTableSorter />
        )}
      </div>
  </div>
}