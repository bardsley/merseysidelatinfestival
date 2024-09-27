'use client'
import { BiAlarmExclamation, BiCheckCircle } from "react-icons/bi";
import { useSearchParams } from "next/navigation"
import {useEffect, useState} from 'react';
import React from "react";
import { TicketRow } from '@components/admin/lists/importRow';
import Papa from 'papaparse';

type Attendee = {
  name: string
  email: string
  phone: string
  checkin_at: string
  passes: string[]
  purchased_at: string
  ticket_number: string | null
  active: boolean
  status: string
  student_ticket: boolean
  transferred_in: boolean
  transferred_out: boolean
  name_changed: boolean
  transferred: boolean
  history: any[]
  unit_amount: number
  cs_id: string
}

const emailOptions = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'new', label: 'New Ticket Numbers Only' },
  { value: 'none', label: 'None' },
]
export const optionsDefault = {
  sendTicketEmails: 'none',

}

export default function ImportPageClient() {
  const [data, setData] = useState<any[][]>([]);
  const [attendeesData, setAttendeesData] = useState<Attendee[]>([]);
  const [options, setOptions] = useState(optionsDefault);
  const [error] = useState(false as boolean | string)
  const [messageShown, setMessageShown] = useState(true)
  const params = useSearchParams()

  const message = params.get('message') || error
  const messageType = params.get('messageType') ? params.get('messageType') : error ? 'bad' : 'good'

  useEffect(() => {
    if(message && messageType == 'good') {
      setTimeout(() => {
        setMessageShown(false) 
      }, 3000)
    }
  }, [])
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData([])
      Papa.parse(file, {
        complete: (result) => {
          const transformedData = result.data.map((row: any) => transformAttendee(row));
          setAttendeesData(transformedData);
          console.log(transformedData)
        },
        header: true,
      })
    }
  }
  
  const transformAttendee = (row: any) => {
    const isStudentTicket = row.type.includes(' (Student)');

    return {
      name: row.name || '',
      email: row.email || '',
      phone: row.telephone,
      checkin_at: row.ticket_used || '',
      passes: isStudentTicket ? [row.type.replace(" (Student)", "")] : [row.type || ''],  
      purchased_at: row.purchase_date ? new Date(parseInt(row.purchase_date_unix) * 1000).toISOString() : '',
      ticket_number: row.ticket_number || null,
      active: true,
      status: 'paid_legacy',
      student_ticket: isStudentTicket,
      transferred_in: false,
      transferred_out: false,
      name_changed: false,
      transferred: null,
      history: [],
      unit_amount: Number(row.unit_amount.substring(1))*100,
      cs_id: row.cs_id
    };
  };
  
  const handleSaveChanges = (updatedAttendee) => {
    setAttendeesData((prevData) =>
    prevData.map((attendee) =>
      attendee.ticket_number === updatedAttendee.ticket_number
      ? updatedAttendee
      : attendee
      )
    )
    console.log(data)
  }

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setOptions((prevOptions) => ({
      ...prevOptions,
      sendTicketEmails: value, 
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      attendees: attendeesData, 
      options: options, 
    }

    const response = await fetch('/api/admin/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    console.log(response)

  }
  
  const headerClassNames = "p-0 text-left text-sm font-semibold text-white "
  const headerContainerClassNames = "flex justify-between"
  const labelClassNames = "py-3.5 pl-4 block"

  const messageClassesBase = "message py-2 pl-4 pr-2 text-white rounded-md flex justify-between items-center transition ease-in-out delay-150 duration-500"
  const messageClassType = messageType =='good' ? 'bg-green-600' : 'bg-red-600'
  const messageIconClasses = "w-6 h-6"
  const messageClassIcon = messageType =='good' ? (<BiCheckCircle className={messageIconClasses}/>) : <BiAlarmExclamation className={messageIconClasses}/>
  const messageClasses = [messageClassesBase,messageClassType].join(' ')
  
  return (
    <div>
      { message ? (<div className={messageClasses + (messageShown ? "" : " opacity-0")} onClick={() => setMessageShown(false)}>{message} {messageClassIcon}</div>) : null }
      <input type="file" accept=".csv .txt" onChange={handleFileUpload} />
      {attendeesData.length > 0 ? (
        <div className="-mx-4 sm:mx-0 mt-3 ">
          <div className="mx-auto max-w-7xl rounded-lg">
            <div className="grid gap-px bg-red/5 grid-cols-2 md:grid-cols-2">
              <div key="" className=" bg-richblack-700 rounded-md px-4 pt-0 pb-2 sm:py-6 sm:px-6 lg:px-8 flex sm:block">
                <p className="text-sm text-gray-300 mb-2">Send Ticket Emails:</p>
                  
                  {/* Dynamically generate radio buttons from the emailOptions array */}
                  {emailOptions.map((option) => (
                    <div className="flex items-center mb-2" key={option.value}>
                      <input
                        id={`sendTicketEmails-${option.value}`}
                        name="sendTicketEmails"
                        type="radio"
                        value={option.value}
                        checked={options.sendTicketEmails === option.value}
                        onChange={handleOptionChange}
                        className="h-4 w-4 border-gray-700 text-indigo-600 focus:ring-indigo-600"
                      />
                      <label
                        htmlFor={`sendTicketEmails-${option.value}`}
                        className="ml-2 text-sm text-gray-300"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                  <button onClick={handleSubmit} className="py-3 px-6 mt-3 float-right bg-chillired-500 rounded-lg block">Submit</button>
              </div>
            </div>
          </div><br />
          <table className="min-w-full">
            <thead className="bg-richblack-700">
              <tr className=''>
                <th scope="col" className={`${headerClassNames} sm:rounded-l-lg`}>
                  <span className={headerContainerClassNames}>
                    <span className={`${labelClassNames} sm:pl-2 `}>Name 
                      <span className='sm:hidden'> & Details</span>
                      <span className='hidden sm:inline lg:hidden'>& Email</span>
                    </span>                    
                  </span>
                </th>
                <th scope="col" className={`${headerClassNames} hidden lg:table-cell`}>
                  <span className={headerContainerClassNames}>
                    <span className={`${labelClassNames}`}>Email</span>
                  </span>
                </th>
                <th scope="col" className={`${headerClassNames} hidden lg:table-cell`}>
                  <span className={headerContainerClassNames}>
                    <span className={`${labelClassNames}`}>Phone</span>
                  </span>
                </th>
                <th scope="col" className={`${headerClassNames} hidden sm:table-cell`}>
                  <span className={headerContainerClassNames}>
                    <span className={`${labelClassNames}`}>Passes</span>
                  </span>
                </th>
                <th scope="col" className={`${headerClassNames} hidden sm:table-cell`}>
                  <span className={headerContainerClassNames}>
                    <span className={`${labelClassNames}`}>Amount</span>
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
              {attendeesData.map((row) => 
              <TicketRow
                key={row.ticket_number} 
                attendee={row}
                handleSaveChanges={handleSaveChanges}
                />
              )}
            </tbody>
          </table>
        </div>
      ): ''}
    </div>
  );

}