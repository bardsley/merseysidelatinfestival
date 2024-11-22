'use client'

import { useSearchParams, useRouter, usePathname} from 'next/navigation'
import { useState} from 'react';
import { ChevronDownIcon, ChevronUpIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid'
import useSWR, {mutate} from "swr";
import NameChangeModal from './modals/nameChangeModal';
import TicketTransferModal from './modals/ticketTransferModal';
import { filterItems, filter, FilterSelector, FilterLabel } from './lists/filterable';
import { TicketRow } from './lists/ticketRow';
import { fetcher } from  "@lib/fetchers";
import ScanSuccessDialog from '@components/admin/scan/ScanSuccessDialog'

export default function TicketList() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const sortByField = searchParams.get("sortByField")
  const sortByDirection = searchParams.get("sortByDirection")
  const filterBy = Array.from(searchParams.getAll('filter')).map(filter => { 
    const [field,initValue] = filter.split(':'); 
    const value = initValue == 'true' ? true : initValue == 'false' ? false : initValue
    return {field, value}
  }) as filter[]

  const [nameChangeModalActive, setNameChangeModalActive] = useState(false)
  const [ticketTransferModalActive, setTicketTransferModalActive] = useState(false)
  const [activeTicket, setActiveTicket] = useState(null)

  const {data, error, isLoading, isValidating} = useSWR("/api/admin/attendees", fetcher, { keepPreviousData: false });
  const attendees = data?.attendees

  const sortFieldToggler = (field) => {
    const newSortDirection = field != sortByField ? 'asc' : sortByDirection == 'asc' ? 'desc' : 'asc'
    const fieldClickFunction = () => {
      const newParams = Array.from(searchParams.entries()).map((entry) => {
        if (entry[0] == "sortByField") { return ["sortByField",field] }
        if (entry[0] == "sortByDirection") { return ["sortByDirection",newSortDirection] }
        return entry
      })
      const newUrl = `${pathname}?${newParams.map(p => p.join('=')).join('&')}`
      router.push(newUrl);
    } 
    const sortIcon = sortByField === field ? 
      newSortDirection == 'asc' ? 
        <ChevronUpIcon className='w-4 h-4'/> 
        : <ChevronDownIcon className='w-4 h-4'/> 
      : <ChevronUpDownIcon className='w-6 h-6' />
    return <a href="#" onClick={fieldClickFunction} className='w-12 sm:w-24 flex justify-end pr-3 items-center'>{sortIcon}</a>
  }

  const addFilter = (filter:filter) => { 
    if(filter.value) {
      const newParams = [...Array.from(searchParams.entries()), ["filter",`${filter.field}:${filter.value}`]].filter(Boolean)
      const newUrl = `${pathname}?${newParams.map(p => p.join('=')).join('&')}`
      router.push(newUrl);
    }
  }

  const removeFilter = (filter:filter) => { 
    console.log("Remote",filter)
    const newParams = Array.from(searchParams.entries()).map((entry) => {
      if (entry[0] == "filter") { 
        const [field,value] = entry[1].split(':')
        
        return field == filter.field && (value == filter.value || value == JSON.stringify(filter.value)) ? null : entry
      }
      return entry
    }).filter(Boolean)
    const newUrl = `${pathname}?${newParams.map(p => p.join('=')).join('&')}`
    router.push(newUrl);
  } 

  const headerClassNames = "p-0 text-left text-sm font-semibold text-white "
  const headerContainerClassNames = "flex justify-between"
  const labelClassNames = "py-3.5 pl-4 block"

  

  if(isLoading) { return <p>Loading...</p> }
  // else if (isValidating) { return <p>Validating...plz</p>} 
  else if (error) { return <p>Error on fetch {JSON.stringify(error)}</p> }
  else if(data?.error) {
    return <p>Error in response {JSON.stringify(data.error)}</p>
  }
  else {
    
    const sortedAttendees = attendees.sort((a, b) => {
      // console.log("Sorting",sortByField,a,b)
      if (sortByDirection === 'desc') {
        return (0 - (a[sortByField] > b[sortByField] ? 1 : -1))
      } else {
        return (0 - (b[sortByField] > a[sortByField] ? 1 : -1)) 
      }
    });
    const filteredAttendees = filterBy ? filterItems(sortedAttendees,filterBy) : sortedAttendees

    return (
      <div className="px-0 my-8 ">
        { nameChangeModalActive ? <NameChangeModal open={nameChangeModalActive} onClose={(value) => { setNameChangeModalActive(value)}} refreshFunction={()=> mutate("/api/admin/attendees")} ticket={activeTicket}/> : null }
        { ticketTransferModalActive ? <TicketTransferModal open={ticketTransferModalActive} onClose={(value) => { setTicketTransferModalActive(value);}} refreshFunction={()=> mutate("/api/admin/attendees")} ticket={activeTicket}/> : null }
        { activeTicket ? <div className='fixed z-50 w-full'>
          <ScanSuccessDialog scan={activeTicket.ticket_number} onClick={()=>{setActiveTicket(false); setTimeout(() => mutate('/api/admin/attendees'),350)}}/></div> : null }

        <div className='flex gap-3'>
          <FilterSelector filters={filterBy} removeFilterFunction={removeFilter}/>
          <div className='flex gap-1 align-start'>
            <span className='text-sm font-semibold mr-1'>Sorted:</span>
            <span className='capitalize'>{sortByField}</span>
            <span className='capitalize'>{sortByDirection == "asc" ? "ascending" : "descending"}</span>
          </div>
          {isValidating ? 
          <div role="status" className='flex'>
            <svg aria-hidden="true" className="w-4 h-4 me-2 text-gray-200 animate-spin dark:text-gray-600 fill-chillired-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
            <span className="">Refreshing...</span>
        </div> : null}
        </div>
        
        <div className="-mx-4 sm:mx-0 mt-3 ">
          <table className="min-w-full">
            <thead className="bg-richblack-700">
              <tr className=''>
                <th scope="col" className={`${headerClassNames} sm:rounded-l-lg`}>
                  <span className={headerContainerClassNames}>
                    <FilterLabel fieldname={"name"} addFilterFunction={addFilter}>
                      <span className={`${labelClassNames} sm:pl-2 `}>Name 
                        <span className='sm:hidden'> & Details</span>
                        <span className='sm:inline lg:hidden'>& Email</span>
                      </span>
                    </FilterLabel>
                    
                    { sortFieldToggler('name') }
                  </span>
                </th>
                <th scope="col" className={`${headerClassNames} hidden lg:table-cell`}>
                  <span className={headerContainerClassNames}>
                    <FilterLabel fieldname={"email"} addFilterFunction={addFilter}>
                      <span className={`${labelClassNames}`}>Email</span>
                    </FilterLabel>
                    { sortFieldToggler('email') }
                  </span>
                </th>
                <th scope="col" className={`${headerClassNames} hidden sm:table-cell`}>
                  <span className={headerContainerClassNames}>
                    <FilterLabel fieldname={"passes"} addFilterFunction={addFilter}>
                      <span className={`${labelClassNames}`}>Passes</span>
                    </FilterLabel>
                    { sortFieldToggler('passes') }
                  </span>
                </th>
                <th scope="col" className={`${headerClassNames} sm:rounded-r-lg max-w-24 flex-grow-0`}>
                  <span className={headerContainerClassNames}>
                    <FilterLabel fieldname={"checkin_at"} addFilterFunction={addFilter}>
                      <span className={`${labelClassNames} text-nowrap`}>Check-in?</span>
                    </FilterLabel>
                    { sortFieldToggler('checkin_at') }
                  </span>
                </th>
                <th scope="col" className={`${headerClassNames} relative py-3.5 pl-3 pr-4 sm:pr-0 min-w-20 hidden sm:table-cell`}>
                  <FilterLabel fieldname={"status"} addFilterFunction={addFilter}>
                    <span className={`${labelClassNames} text-nowrap`}>Status</span>
                  </FilterLabel>
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0 min-w-20">
                  <span className="sr-only">Edit</span>
                  {}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-none">
              {filteredAttendees.map((attendee) => 
              <TicketRow key={attendee.ticket_number} attendee={attendee} setActiveTicket={setActiveTicket} setNameChangeModalActive={setNameChangeModalActive} setTicketTransferModalActive={setTicketTransferModalActive} />
              )}
            </tbody>
          </table>
          
        </div>
      </div>
    )
  }
}

