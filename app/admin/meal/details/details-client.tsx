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
    <MealStatsTable />
    <br />
    <AttendeesMealTable attendees={attendees} summaryLoading={attendeeLoading} summaryIsValidating={attendeeValidating} summaryError={attendeeError} attendeesGroupedByTable={true} />
    </>)
}