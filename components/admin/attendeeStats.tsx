'use client'
import useSWR from "swr";
import { fetcher } from  "@lib/fetchers";
import StatBlock, { StatLine } from "@components/admin/statBlock";
import { subWeeks } from 'date-fns'
import { guaranteeTimestampFromDate } from '@lib/useful';


export default function AttendeeStats() {
  const {data, error, isLoading} = useSWR("/api/admin/attendees", fetcher, { keepPreviousData: false });

  const thisYearsAttendees = data?.attendees?.filter((row:any)=>{
    // console.log(row)
    return row.passes
      && row.passes.length > 0 
      && row.passes.filter((item:any) => { return /2025/.test(item) }).length > 0
  
  })

  const stats =  isLoading ? 
    [
      { name: 'Total', value: 'Loading...', unit: '' },
      { name: 'Today', value: 'Loading...', unit: '' },
      { name: 'Meal prefs', value: 'Loading...', unit: '' },
      { name: 'Dinner Prefs', value: 'Loading...', unit: '' }
    ] as StatLine[]
    : error ? [
      { name: 'Total', value:  "Error", unit: '' },
      { name: 'Today', value: 'Error', unit: '' },
      { name: 'Meal prefs', value: 'Error', unit: '' },
      { name: 'Dinner Prefs', value: 'Error', unit: '' }
    ] as StatLine[]
    : [
      { name: 'Total', value: thisYearsAttendees.length, unit: 'tickets' },
      { name: 'This week', value: thisYearsAttendees.filter((row)=>{
        return guaranteeTimestampFromDate(row.purchased_date) > subWeeks(new Date(),1).getTime()
      }).length, unit: 'tickets' },
      { name: 'Meal prefs', value: thisYearsAttendees.filter((row)=>{return row.meal_preferences && row.meal_preferences.choices && row.meal_preferences.choices.every(choice => choice != -1 )}).length, unit: 'set' },
      { name: 'Dinner Prefs', value: 'Unknown', unit: '' }
    ] as StatLine[]

  return <StatBlock stats={stats}></StatBlock>
  // return <div>{JSON.stringify(stats,null,2)}</div>
}