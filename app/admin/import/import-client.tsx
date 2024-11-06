'use client'
import { BiAlarmExclamation, BiCheckCircle } from "react-icons/bi";
import { useSearchParams } from "next/navigation"
import {useEffect, useState} from 'react';
import React from "react";
import { ImportRow } from '@components/admin/lists/importRow';
import Papa from 'papaparse';
import {guaranteeISOstringFromDate} from '@lib/useful'
import { IndexKind } from "typescript";

type Attendee = {
  index: number
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
  sendMealUpgrade: null,

}

export default function ImportPageClient() {
  const [data, setData] = useState<any[][]>([]);
  const [attendeesData, setAttendeesData] = useState<Attendee[]>([]);
  const [isEditingIndex, setIsEditingIndex] = useState<number | null>(null);
  const [options, setOptions] = useState(optionsDefault);
  const [error] = useState(false as boolean | string)
  const [messageShown, setMessageShown] = useState(true)
  const params = useSearchParams()
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const message = params.get('message') || error
  const messageType = params.get('messageType') ? params.get('messageType') : error ? 'bad' : 'good'

  useEffect(() => {
    if(message && messageType == 'good') {
      setTimeout(() => {
        setMessageShown(false) 
      }, 3000)
    }
  }, [])

  const toggleRowSelection = (index: number) => {
    setSelectedRows((prevSelected) => {
      if (prevSelected.includes(index)) {
        return prevSelected.filter((i) => i !== index);
      } else {
        return [...prevSelected, index];
      }      
    })
  }
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData([])
      Papa.parse(file, {
        complete: (result) => {
          const transformedData = result.data.map((row: any, index: number) => { console.log(index,row); return transformAttendee(row, index)})  ;
          setAttendeesData(transformedData);
          console.log(transformedData)
        },
        header: true,
      })
    }
  }
  
  const transformAttendee = (row: any, index: number) => {
    const isStudentTicket = row.type.includes(' (Student)');

    return {
      index,
      name: row.name || '',
      email: row.email || '',
      phone: row.telephone,
      checkin_at: row.ticket_used || '',
      passes: isStudentTicket ? [row.type.replace(" (Student)", "")] : [row.type || ''],  
      purchased_at: row.purchase_date ? guaranteeISOstringFromDate(row.purchase_date) : '',
      ticket_number: row.ticket_number || null,
      active: true,
      status: 'paid_legacy',
      student_ticket: isStudentTicket,
      transferred_in: false,
      transferred_out: false,
      name_changed: false,
      transferred: null,
      history: [],
      unit_amount: row.unit_amount ? Number(row.unit_amount.substring(1))*100 : 999999999999, 
      cs_id: row.cs_id
    };
  };
  
  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setOptions((prevOptions) => ({
      ...prevOptions,
      sendTicketEmails: value, 
    }))
  }

  const handleAddRow = () => {
    const newIndex = attendeesData.length;
    const newRow = {
      index: newIndex,
      name: '',
      email: '',
      phone: '',
      checkin_at: '',
      passes: [],
      purchased_at: '',
      ticket_number: null,
      active: true,
      status: 'draft', 
      student_ticket: false,
      transferred_in: false,
      transferred_out: false,
      name_changed: false,
      transferred: null,
      history: [],
      unit_amount: 0,
      cs_id: '',
    }
    setAttendeesData([...attendeesData,newRow]);
  }

  const handleEditToggle = (index: number | null) => {
    setIsEditingIndex(index);
    console.log(selectedRows)
  }

  const handleSaveChanges = (updatedAttendee) => {
    setAttendeesData((prevData) =>
    prevData.map((attendee) =>
      attendee.index === updatedAttendee.index
      ? updatedAttendee
      : attendee
      )
    )
    console.log(data)
    setIsEditingIndex(null)
  }

  const handleDeleteRow = (indexToDelete: number | null) => {
    const updatedAttendees = attendeesData.filter((_, index) => index !== indexToDelete)

    const reindexedAttendees = updatedAttendees.map((attendee, newIndex) => ({
      ...attendee,
      index: newIndex
    }))

    setIsEditingIndex(null);
    setAttendeesData(reindexedAttendees);
  };  

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

  const handleBulkEdit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const passType = formData.get('passType') as string;
    const unitAmount = formData.get('unitAmount') as string;
    const studentTicket = formData.get('studentTicket') === 'on';
    const status = formData.get('status') as string;

    const updatedData = attendeesData.map((attendee) => {
      if (selectedRows.includes(attendee.index)) {
        return {
          ...attendee,
          passes: passType ? [passType] : attendee.passes,
          unit_amount: unitAmount ? parseInt(unitAmount, 10) : attendee.unit_amount,
          student_ticket: studentTicket,
          status: status || attendee.status,
        };
      }
      return attendee;
    });

    setAttendeesData(updatedData);
    setSelectedRows([]); 
    // e.target.reset(); 
  }

  const deselectAll = () => setSelectedRows([]);
  
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
      <input type="file" accept=".csv,.txt" onChange={handleFileUpload} />
        <div className="-mx-4 sm:mx-0 mt-3 ">
          <div className="mx-auto max-w-7xl rounded-lg">
            <div className="grid gap-px bg-red/5 grid-cols-3 md:grid-cols-3">
              <div className="bg-richblack-700 rounded-md px-4 pt-0 pb-2 sm:py-6 sm:px-6 lg:px-8 flex sm:block">
                <p className="text-sm text-gray-300 mb-2">Settings</p>
                
                {/* Send Ticket Emails dropdown */}
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium text-gray-300">Send Ticket Emails</label>
                  <select
                    name="sendTicketEmails"
                    value={options.sendTicketEmails}
                    onChange={(e) => setOptions({ ...options, sendTicketEmails: e.target.value })}
                    className="ml-2 block w-2/3 rounded-md border-gray-300 shadow-sm text-gray-800 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  >
                    {emailOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Send Meal Upgrade setting with tooltip */}
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium text-gray-300">Send Meal Upgrade</label>
                  <div className="flex items-center">
                    <div className="ml-1 text-xs bg-gray-700 rounded-full p-0.5 w-4 h-4 flex items-center justify-center cursor-pointer relative group">
                      ?
                      <div className="absolute hidden group-hover:block bg-white text-gray-900 text-xs rounded shadow-lg p-2 mt-2 w-48">
                        For volunteers or artist tickets, will send meal upgrade link to tickets without meal inlcuded.
                      </div>
                    </div>
                    <select
                      name="sendMealUpgrade"
                      onChange={(e) =>
                        setOptions({ ...options, sendMealUpgrade: e.target.value === 'true' })
                      }
                      className="ml-2 block w-2/3 rounded-md border-gray-300 shadow-sm text-gray-800 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                </div>

                <button onClick={handleSubmit} className="py-3 px-6 mt-3 float-right bg-chillired-500 rounded-lg block">
                  Submit
                </button>
              </div>

              <div className="bg-richblack-700 rounded-md px-4 py-6 sm:py-6 sm:px-6 lg:px-8 flex flex-col">
                <p className="text-sm text-gray-300 mb-2">Bulk Edit Options:</p>
                <form onSubmit={handleBulkEdit} className="">
                  <label className="block text-sm font-medium text-gray-300 m-1 mt-3">
                    Pass Type
                    <select
                      name="passType"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-800 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                      <option value="">Select Pass Type</option>
                      <option value="general">General Admission</option>
                      <option value="vip">VIP</option>
                      <option value="student">Student</option>
                      <option value="press">Press</option>
                    </select>
                  </label>

                  <label className="block text-sm font-medium text-gray-300 m-1 mt-3">
                    Unit Amount
                    <input
                      type="number"
                      name="unitAmount"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-800 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </label>

                  <label className="block text-sm font-medium text-gray-300 col-span-2 m-1 mt-3">
                    Status
                    <select
                      name="status"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-800 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                      <option value="">Select Status</option>
                      <option value="paid_stripe">Paid Online</option>
                      <option value="paid_cash">Paid Cash</option>
                      <option value="gratis">Free Ticket</option>
                    </select>
                  </label>

                  <label className="block text-sm font-medium text-gray-300 col-span-2 m-1 mt-3">
                    <input
                      type="checkbox"
                      name="studentTicket"
                      className="mr-2 h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Student
                  </label>
                  <div className="flex justify-between items-center col-span-2 mt-4">
                    <div className="flex items-center">
                      <span className="text-xs text-gray-400 mr-2">Selected Rows: {selectedRows.length}</span>
                      <button
                        type="button"
                        onClick={deselectAll}
                        className="text-xs text-blue-400 underline"
                      >
                        Deselect All
                      </button>
                    </div>
                    <button
                      type="submit"
                      className="py-2 px-4 bg-blue-500 text-white rounded-lg font-semibold shadow-sm"
                    >
                      Apply Bulk Edit
                    </button>
                  </div>
                </form>
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
              {attendeesData.map((row,index) => 
              <ImportRow
                key={`${row.ticket_number}-${index}`}
                attendee={row}
                handleSaveChanges={handleSaveChanges}
                onDelete={() => handleDeleteRow(row.index)}
                isEditing={isEditingIndex === row.index}
                toggleEdit={() => handleEditToggle(row.index)}
                isSelected={selectedRows.includes(row.index)}
                toggleSelection={() => toggleRowSelection(row.index)}
                />
              )}
              <tr>
                <td colSpan={6} className="text-center py-2">
                  <button onClick={handleAddRow} className="py-2 px-4 bg-blue-300 text-white rounded">Add Row</button>
                </td>
                {selectedRows}
              </tr>
            </tbody>
          </table>
        </div>
    </div>
  );

}