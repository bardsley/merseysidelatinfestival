import { XMarkIcon } from '@heroicons/react/24/solid'
import {format } from 'date-fns'
import React, { useState, useRef } from 'react';

export type filter = { field: string, value:any}
export type filterFunction = (filter: filter) => void

type FilterLabelProps =  {fieldname: string, addFilterFunction:filterFunction,  children?: React.ReactNode}

export const FilterLabel: React.FC<FilterLabelProps> = ({fieldname,addFilterFunction,children}) => {
  const [filtering, setFiltering] = useState(false)
  const currentInput = useRef(null)
  return filtering ? (
    <input ref={currentInput} className="border-b border-t-0 bg-richblack-500 text-white w-full" type="text" placeholder={fieldname} size={10} autoFocus={true} 
      onBlur={(evt) => {addFilterFunction({field: fieldname, value: evt.target.value}); setFiltering(false)}}
      onKeyUp={(evt) => {if (evt.key === 'Enter' && currentInput.current ) {setFiltering(false); addFilterFunction({field: fieldname, value: currentInput.current.value}) }}}
    />
  ):
  (<a href='#' className="block w-full  " onClick={() => setFiltering(true)}>{children}</a>)
}

export const FilterSelector = ({filters,removeFilterFunction}:{filters: filter[],removeFilterFunction: filterFunction}) => {
  return ( 
  <div className='flex gap-1 align-start'>
    <span className='text-sm font-semibold mr-3'>Filters:</span>
    {filters.map((filter)=>{
        const [filterText,negative] = typeof filter.value === 'boolean' ? [JSON.stringify(filter.value),false] : 
          typeof filter.value == 'string' && filter.value.slice(0,1) == '!' ? [filter.value.slice(1),true]
            : [filter.value,false]
        return (
        <span key={`${filter.field}${filter.value}`} onClick={() => removeFilterFunction(filter)}
          className='hover:cursor-pointer flex items-center rounded-full bg-gray-400 text-black pl-2 pr-1 py-0'
        >
          {filter.field} { negative ? '≠' : '='} &quot;{filterText}&quot;
          <XMarkIcon className='w-4 h-4 ml-1 mr-1'/> 
        </span>)
    })}  
  </div> 
  )
}

export const filterItems = (items, filters) => {
  return items.filter((person) => { 
    let excludePerson = false // Start out not excluding
    filters.forEach((filter) => {
      const [invertFilter,filterValue] = typeof filter.value == 'string' ? filter.value.slice(0,1) == '!' ? [true, filter.value.slice(1)] : [false, filter.value] : [false, filter.value]
      if (filter.field == 'name') {
        const matches = person[filter.field].toLowerCase().includes(filterValue.toLowerCase())
        excludePerson = excludePerson || (invertFilter ? matches : !matches)
      } else if (filter.field == 'passes') {
        const matches = person[filter.field].map((pass) => pass.toLowerCase()).join(', ').includes(filterValue.toLowerCase())
        excludePerson = excludePerson || (invertFilter ? matches : !matches)
      } else if (filter.field == 'signed_in') {
        excludePerson = excludePerson || (person[filter.field] && format(new Date(person[filter.field]), 'eee') != filterValue)
      } else if (filter.field == 'active') {
        excludePerson = excludePerson || person[filter.field] != filterValue
      } else {
        const matches = person[filter.field].includes(filterValue)
        excludePerson = excludePerson || (invertFilter ? matches : !matches)
      }      })
    return !excludePerson //* ! because above calculates exclude and filter needs true for keep
  })
}