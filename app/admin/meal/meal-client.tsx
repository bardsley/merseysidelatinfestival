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
  const {data: attendeeData} = useSWR('/api/admin/attendees', fetcher, { keepPreviousData: false });

  const attendeesAll = summaryData && summaryData.meal_attendees_list
  // console.log("attendeesAll", attendeesAll)
  const attendees = attendeesAll //? attendeesAll.filter((attendee) => /dinner/i.test(attendee.pass_type)) : []

  const handleExport = () => {
    if (!attendees?.length) return;

    const escapeCsvValue = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const emailsByTicket = new Map((attendeeData?.attendees || []).map((attendee) => [String(attendee.ticket_number), attendee.email || '']));
    const rows = [
      ['Forename', 'Surname', 'Email', 'Ticket Number'],
      ...attendees.map((attendee) => [
        ...(String(attendee.full_name || '').trim().split(/\s+(?=[^\s]+$)/).length > 1
          ? String(attendee.full_name).trim().split(/\s+(?=[^\s]+$)/)
          : [String(attendee.full_name || '').trim(), '']),
        attendee.email || emailsByTicket.get(String(attendee.ticket_number)) || '',
        attendee.ticket_number,
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCsvValue).join(',')).join('\r\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'meal-attendees.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

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
        <button onClick={handleExport} disabled={!attendees?.length} className="py-3 px-6 mt-3 mr-3 float-right bg-chillired-500 rounded-lg block disabled:cursor-not-allowed disabled:opacity-50">Export Meal Attendees CSV</button>
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
