'use client'
import useSWR from "swr";
import { fetcher } from  "@lib/fetchers";
import StatBlock, { StatLine } from "@components/admin/statBlock";
import { subWeeks } from 'date-fns'
import { guaranteeTimestampFromDate } from '@lib/useful';


export default function AttendeeStats() {
  const {data, error, isLoading} = useSWR("/api/admin/attendees", fetcher, { keepPreviousData: false });

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
      { name: 'Total', value: data.attendees?.length, unit: 'tickets' },
      { name: 'This week', value: data.attendees?.filter((row)=>{
        return guaranteeTimestampFromDate(row.purchased_date) > subWeeks(new Date(),1).getTime()
      }).length, unit: 'tickets' },
      { name: 'Meal prefs', value: data.attendees?.filter((row)=>{return row.meal_preferences}).length, unit: 'set' },
      { name: 'Dinner Prefs', value: 'Unknown', unit: '' }
    ] as StatLine[]

  return <StatBlock stats={stats}></StatBlock>
  // return <div>{JSON.stringify(stats,null,2)}</div>
}