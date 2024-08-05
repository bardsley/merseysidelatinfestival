'use client'
import { useState} from 'react';
import { ChevronDownIcon, ChevronUpIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid'

import useSWR, {mutate} from "swr";
import NameChangeModal from './modals/nameChangeModal';
import TicketTransferModal from './modals/ticketTransferModal';
import { filterItems, filter, FilterSelector, FilterLabel } from './lists/filterable';
import { TicketRow } from './lists/ticketRow';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TicketList() {
  const [sortBy, setSortBy] = useState('purchased_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterBy, setFilterBy] = useState([{field: "active", value: true}] as filter[]);


  const [nameChangeModalActive, setNameChangeModalActive] = useState(false)
  const [ticketTransferModalActive, setTicketTransferModalActive] = useState(false)
  const [activeTicket, setActiveTicket] = useState(null)

  const {data, error, isLoading, isValidating} = useSWR("/api/admin/attendees", fetcher);
  const attendees = data?.attendees

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

  const addFilter = (filter:filter) => { filter.value ? setFilterBy([...filterBy, filter]) : null }
  const removeFilter = (filter:filter) => { setFilterBy(filterBy.filter(f => { return !(f.field == filter.field && f.value == filter.value) })) } 

  const headerClassNames = "p-0 text-left text-sm font-semibold text-white "
  const headerContainerClassNames = "flex justify-between"
  const labelClassNames = "py-3.5 pl-4 block"

  if(isLoading) { return <p>Loading...</p> }
  else if (isValidating) { return <p>Validating...</p>} 
  else if (error) { return <p>Error {JSON.stringify(error)}</p> }
  else if(data?.error) {
    return <p>Error {JSON.stringify(data.error)}</p>
  }
  else {
    
    const sortedAttendees = attendees.sort((a, b) => {
      if (sortDirection === 'desc') {
        return (0 - (a[sortBy] > b[sortBy] ? 1 : -1))
      } else {
        return (0 - (b[sortBy] > a[sortBy] ? 1 : -1)) 
      }
    });
    const filteredAttendees = filterBy ? filterItems(sortedAttendees,filterBy) : sortedAttendees

    return (
      <div className="px-0 my-8 ">
        { nameChangeModalActive ? <NameChangeModal open={nameChangeModalActive} onClose={(value) => { setNameChangeModalActive(value)}} refreshFunction={()=> mutate("/api/admin/attendees")} ticket={activeTicket}/> : null }
        { ticketTransferModalActive ? <TicketTransferModal open={ticketTransferModalActive} onClose={(value) => { setTicketTransferModalActive(value);}} refreshFunction={()=> mutate("/api/admin/attendees")} ticket={activeTicket}/> : null }
        <FilterSelector filters={filterBy} removeFilterFunction={removeFilter}/>
        <div className="-mx-4 sm:mx-0 mt-3 ">
          <table className="min-w-full">
            <thead className="bg-richblack-700">
              <tr className=''>
                <th scope="col" className={`${headerClassNames} sm:rounded-l-lg`}>
                  <span className={headerContainerClassNames}>
                    <FilterLabel fieldname={"name"} addFilterFunction={addFilter}>
                      <span className={`${labelClassNames} sm:pl-2 `}>Name 
                        <span className='sm:hidden'> & Details</span>
                        <span className='hidden sm:inline lg:hidden'>& Email</span>
                      </span>
                    </FilterLabel>
                    
                    { sortField('name') }
                  </span>
                </th>
                <th scope="col" className={`${headerClassNames} hidden lg:table-cell`}>
                  <span className={headerContainerClassNames}>
                    <FilterLabel fieldname={"email"} addFilterFunction={addFilter}>
                      <span className={`${labelClassNames}`}>Email</span>
                    </FilterLabel>
                    { sortField('email') }
                  </span>
                </th>
                <th scope="col" className={`${headerClassNames} hidden sm:table-cell`}>
                  <span className={headerContainerClassNames}>
                    <FilterLabel fieldname={"passes"} addFilterFunction={addFilter}>
                      <span className={`${labelClassNames}`}>Passes</span>
                    </FilterLabel>
                    { sortField('passes') }
                  </span>
                </th>
                <th scope="col" className={`${headerClassNames} sm:rounded-r-lg max-w-24 flex-grow-0`}>
                  <span className={headerContainerClassNames}>
                    <FilterLabel fieldname={"signed_in"} addFilterFunction={addFilter}>
                      <span className={`${labelClassNames} text-nowrap`}>Check-in?</span>
                    </FilterLabel>
                    { sortField('signed_in') }
                  </span>
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0 min-w-20 hidden sm:table-cell">
                  <span className="sr-only">Status</span>
                  {}
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0 min-w-20">
                  <span className="sr-only">Edit</span>
                  {}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-none">
              {filteredAttendees.map((attendee) => <TicketRow key={attendee.id} attendee={attendee} setActiveTicket={setActiveTicket} setNameChangeModalActive={setNameChangeModalActive} setTicketTransferModalActive={setTicketTransferModalActive} />)}
            </tbody>
          </table>
          
        </div>
      </div>
    )
  }
}

