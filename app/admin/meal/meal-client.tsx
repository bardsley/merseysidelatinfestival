'use client'
import React, { useState } from "react";
import useSWR from 'swr';
import { fetcher } from  "@lib/fetchers";
import AttendeesMealTable from "@components/admin/attendeeMealTable";
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

      <AttendeesMealTable attendees={attendees} summaryLoading={summaryLoading} summaryError={summaryError} />
  </div>
}