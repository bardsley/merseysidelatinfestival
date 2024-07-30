'use client'
import {format } from 'date-fns'
import { useState, useRef } from 'react';
import { ChevronDownIcon, ChevronUpIcon, ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/24/solid'



export default function TicketList() {
  const [sortBy, setSortBy] = useState('purchased_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterBy, setFilterBy] = useState('');
  const [filterByField, setFilterByField] = useState('');

  const people = [
    { name: 'Arnold Swarzenegger', email: 'arnie@gmail.com', signed_in: '2024-11-29T19:06:00.000Z', passes: ['Party Pass', 'Saturday Classes'], purchased_at: '2024-11-22T19:06:00.000Z' },
    { name: 'Jonathon Walton', email: 'jonathon.walton@reallylongemail.com', signed_in: '2024-11-29T19:26:00.000Z', passes: ['Saturday Pass'], purchased_at: '2024-10-01-T19:06:00.000Z' },
    { name: 'Sarah Marshal', email: 'ihate@sarahmarshal.com', signed_in: '2024-11-30T10:00:00.000Z', passes: ['Full Pass'], purchased_at: '2024-11-22T19:06:00.000Z' },
    { name: 'Lindsay Lohan', email: 'lindsay.havinfun@gmail.com', signed_in: '2024-12-01T12:00:00.000Z', passes: ['Class Pass', 'Dinner and Dine Pass'], purchased_at: '2024-11-21T19:06:00.000Z' },
    { name: 'Big Al', email: 'idance.on.tuesdays@thatplace.com', signed_in: null, passes: ['Class Pass'], purchased_at: '2024-06-22T19:06:00.000Z' },
    { name: 'Cheep Brin', email: 'noemail', signed_in: null, passes: ['Saturday Ticket'], purchased_at: '2024-06-22T19:06:00.000Z' },

    // More people...
  ]

  const sortedPeople = people.sort((a, b) => {
        if (sortDirection === 'desc') {
      return (0 - (a[sortBy] > b[sortBy] ? 1 : -1))
    } else {
      return (0 - (b[sortBy] > a[sortBy] ? 1 : -1)) 
    }
  });

  const filteredPeople = filterByField ? sortedPeople.filter((person) => { 
    if(!filterBy) {
      return true
    }
    if(['name','email'].includes(filterByField)) {
      return person[filterByField].toLowerCase().includes(filterBy.toLowerCase())
    }
    if(filterByField == 'passes') {
      return person[filterByField].map((pass) => pass.toLowerCase()).join(', ').includes(filterBy.toLowerCase())
    }
    if(filterByField == 'signed_in') {
      return person[filterByField] && format(new Date(person[filterByField]), 'eee') == filterBy
    }
    else {return true}
    
  }) : sortedPeople

  const sortField = (field) => {
    const newSortDirection = field != sortBy ? 'asc' : sortDirection == 'asc' ? 'desc' : 'asc'
    const fieldClickFunction = () => {setSortBy(field); setSortDirection(newSortDirection)} 
    const sortIcon = sortBy === field ? 
        newSortDirection == 'asc' ? 
          <ChevronUpIcon className='w-4 h-4'/> 
          : <ChevronDownIcon className='w-4 h-4'/> 
        : <ChevronUpDownIcon className='w-6 h-6' />
      return <a href="#" onClick={fieldClickFunction} className='w-12 sm:w-24 flex justify-end pr-3 items-center'>{sortIcon}</a>
  }




  const FilterLabel = ({fieldname,setFilterFunction,children}) => {
    const [filtering, setFiltering] = useState(false)
    const currentInput = useRef(null)
    return filtering ? (
      <input ref={currentInput} className="border-b border-t-0 bg-richblack-500 text-white" type="text" placeholder={fieldname} size={10} autoFocus={true} 
        onBlur={(evt) => {setFilterFunction(evt.target.value); setFiltering(false)}}
        onKeyUp={(evt) => {if (evt.key === 'Enter') {setFiltering(false); setFilterFunction(currentInput.current.value) }}}
      />
    ):
    (<a href='#' className="block w-full  " onClick={() => setFiltering(true)}>{children}</a>)
  }

  const headerClassNames = "p-0 text-left text-sm font-semibold text-white "
  const headerContainerClassNames = "flex justify-between"
  const labelClassNames = "py-3.5 pl-4 block"
  return (
    <div className="px-0 my-8 ">
      { filterBy ? <div className='flex' onClick={() => setFilterBy('')}><span className='hover:cursor-pointer flex items-center rounded-md bg-gray-400 text-black pl-3 py-0'>Filtered by {filterByField}: &quot;{filterBy}&quot; <XMarkIcon className='w-4 h-4 ml-1 mr-1'/> </span></div> : null }
      <div className="-mx-4 sm:mx-0 mt-3 ">
        <table className="min-w-full">
          <thead className="bg-richblack-700">
            <tr className=''>
              <th scope="col" className={`${headerClassNames} sm:rounded-l-lg`}>
                <span className={headerContainerClassNames}>
                  <FilterLabel fieldname={"name"} setFilterFunction={(filter) => { setFilterByField('name'); setFilterBy(filter) }}>
                    <span className={`${labelClassNames} sm:pl-2 `}>Name <span className='sm:hidden'> & Details</span><span className='hidden sm:inline lg:hidden'>& Email</span></span>
                  </FilterLabel>
                  
                  { sortField('name') }
                </span>
              </th>
              <th scope="col" className={`${headerClassNames} hidden lg:table-cell`}>
                <span className={headerContainerClassNames}>
                  <FilterLabel fieldname={"email"} setFilterFunction={(filter) => { setFilterByField('email'); setFilterBy(filter) }}>
                    <span className={`${labelClassNames}`}>Email</span>
                  </FilterLabel>
                  { sortField('email') }
                </span>
              </th>
              <th scope="col" className={`${headerClassNames} hidden sm:table-cell`}>
                <span className={headerContainerClassNames}>
                  <FilterLabel fieldname={"passes"} setFilterFunction={(filter) => { setFilterByField('passes'); setFilterBy(filter) }}>
                    <span className={`${labelClassNames}`}>Passes</span>
                  </FilterLabel>
                  { sortField('passes') }
                </span>
              </th>
              <th scope="col" className={`${headerClassNames} sm:rounded-r-lg`}>
                <span className={headerContainerClassNames}>
                  <FilterLabel fieldname={"signed_in"} setFilterFunction={(filter) => { setFilterByField('signed_in'); setFilterBy(filter)}}>
                    <span className={`${labelClassNames} text-nowrap`}>Sign in?</span>
                  </FilterLabel>
                  { sortField('signed_in') }
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-none">
            {filteredPeople.map((person) => { 
              const passString = person.passes.join(', ')
              return(
              <tr key={person.email} className='align-bottom'>
                <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm  font-medium text-white sm:w-auto sm:max-w-none sm:pl-2 vertical-align-top">
                  <a href="#" className="text-chillired-600 hover:text-chillired-700">
                    <span className="text-lg leading-6 sm:text-base md:text-base">{person.name}</span>
                  </a>
                  <dl className="font-normal lg:hidden">
                    <dt className="sr-only">Email</dt>
                    <dd className="mt-1 truncate text-gray-100">{person.email}</dd>
                    <dt className="sr-only sm:hidden">Passes</dt>
                    <dd className="mt-1 truncate text-gray-100 sm:hidden">{passString}</dd>
                  </dl>
                </td>
                <td className="hidden px-3 py-4 text-sm text-gray-200 lg:table-cell">{person.email}</td>
                <td className="hidden px-3 py-4 text-sm text-gray-200 sm:table-cell">{passString}</td>
                <td className="px-3 py-4 text-sm text-gray-200 text-nowrap flex flex-col items-center">
                  {person.signed_in ? format(person.signed_in,'EEE HH:mm') :  <button className='bg-green-700 text-white rounded-full px-4 py-1'>Sign in</button>}
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  )
}
