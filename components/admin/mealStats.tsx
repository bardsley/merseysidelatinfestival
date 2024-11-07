'use client'
import useSWR from "swr";
import { fetcher } from  "@lib/fetchers";
import StatBlock, { StatLine } from "@components/admin/statBlock";

export default function MealStats() {
  const {data, error, isLoading} = useSWR("/api/admin/meal/summary", fetcher, { keepPreviousData: false });

  const statsTopLine =  isLoading ? 
    [
      { name: 'Not selected', value: 'Loading...', unit: '' },
      { name: 'Complete', value: 'Loading...', unit: '' },
      { name: 'Partial', value: 'Loading...', unit: '' },
      { name: 'Not wanted', value: 'Loading...', unit: '' },
      { name: 'Total', value: 'Loading...', unit: '' }
    ] as StatLine[]
    : error ? [
      { name: 'Not selected', value: 'Error', unit: '' },
      { name: 'Complete', value:  "Error", unit: '' },
      { name: 'Partial', value: 'Error', unit: '' },
      { name: 'Not wanted', value: 'Error', unit: '' },
      { name: 'Total', value: 'Error', unit: '' }
    ] as StatLine[]
    : [
        { name: 'Not selected', value: data.statistics.not_selected_count, unit: '' },
        { name: 'Complete', value: data.statistics.selected_count, unit: '' },
        { name: 'Partial', value:  data.statistics.incomplete_count, unit: '' },
        { name: 'Not wanted', value: data.statistics.not_wanted_count, unit: '' },
        { name: 'Total', value: data.statistics.not_selected_count + data.statistics.selected_count, unit: '' }
      ] as StatLine[]

  const starterStats = isLoading ?
    [
      {name: 'Chicken Liver Pate', value: 'Loading...', unit: ''}, 
      {name: 'Vegetable Terrine', value: 'Loading...', unit: ''}
    ] as StatLine[]
    : error ? [
      {name: 'Chicken Liver Pate', value: 'Error', unit: ''}, 
      {name: 'Vegetable Terrine', value: 'Error', unit: ''}
    ] as StatLine[]
    : [
      {name: 'Chicken Liver Pate', value: data.statistics.course_frequencies[0]['Chicken Liver Pate'], unit: ''}, 
      {name: 'Vegetable Terrine', value: data.statistics.course_frequencies[0]['Vegetable Terrine'], unit: ''}
    ] as StatLine[]

  const mainStats = isLoading ?
    [
      {name: 'Fish and Prawn Risotto', value: 'Loading...', unit: ''}, 
      {name: 'Roasted Onion', value: 'Loading...', unit: ''},
      {name: 'Chicken Supreme', value: 'Loading...', unit: ''}
    ] as StatLine[]
    : error ? [
      {name: 'Fish and Prawn Risotto', value: 'Error', unit: ''}, 
      {name: 'Roasted Onion', value: 'Error', unit: ''},
      {name: 'Chicken Supreme', value: 'Error', unit: ''}
    ] as StatLine[]
    : [
      {name: 'Fish and Prawn Risotto', value: data.statistics.course_frequencies[1]['Fish and Prawn Risotto'], unit: ''}, 
      {name: 'Roasted Onion', value: data.statistics.course_frequencies[1]['Roasted Onion'], unit: ''},
      {name: 'Chicken Supreme', value: data.statistics.course_frequencies[1]['Chicken Supreme'], unit: ''}
    ] as StatLine[]

  const desertStats = isLoading ?
    [
      {name: 'Bread and Butter Pudding', value: 'Loading...', unit: ''}, 
      {name: 'Fruit Platter', value: 'Loading...', unit: ''}
    ] as StatLine[]
    : error ? [
      {name: 'Bread and Butter Pudding', value: 'Error', unit: ''}, 
      {name: 'Fruit Platter', value: 'Error', unit: ''}
    ] as StatLine[]
    : [
      {name: 'Bread and Butter Pudding', value: data.statistics.course_frequencies[2]['Bread and Butter Pudding'], unit: ''}, 
      {name: 'Fruit Platter', value: data.statistics.course_frequencies[2]['Fruit Platter'], unit: ''}
    ] as StatLine[]
  return (
    <div>
      <StatBlock stats={statsTopLine}></StatBlock>
      <br />
      <h1>Starters</h1>
      <StatBlock stats={starterStats}></StatBlock>
      <br />
      <h1>Mains</h1>
      <StatBlock stats={mainStats}></StatBlock>
      <br />
      <h1>Deserts</h1>
      <StatBlock stats={desertStats}></StatBlock>
      
      {/* { data?.statistics ? <pre>{JSON.stringify(data,null,2)}</pre> : null } */}
    </div>
  )
}