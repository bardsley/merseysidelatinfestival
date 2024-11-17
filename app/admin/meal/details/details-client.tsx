'use client'
import React, { useState } from "react";
import useSWR from 'swr';
import { fetcher } from  "@lib/fetchers";
import AttendeesMealTable from "@components/admin/attendeeMealTable";
import MealStatsTable from "@components/admin/mealStatsTable";
const mealTableApiUrl = "/api/admin/meal/seating";

export default function DetailsPageClient() {  
  const {data: attendeeData, error: attendeeError, isLoading: attendeeLoading, isValidating: attendeeValidating} = useSWR(mealTableApiUrl, fetcher, { keepPreviousData: false });

  const attendees = attendeeData && attendeeData.seating_data
  
  return (<>
    <div className='flex align-baseline'>
      <h1 className="text-2xl md:text-5xl px-4 ">Meal Information</h1>
    </div>
    <div className="text-xl">Statistics summary</div>
    <MealStatsTable />
    <br />
    <span className="text-xl">Attendees breakdown</span>
    <AttendeesMealTable attendees={attendees} summaryLoading={attendeeLoading} summaryIsValidating={attendeeValidating} summaryError={attendeeError} attendeesGroupedByTable={true} />
    </>)
}