'use client'
import { BiAlarmExclamation, BiCheckCircle } from "react-icons/bi";
import {useEffect, useState} from 'react';
import React from "react";
import { ImportRow } from '@components/admin/lists/importRow';
import Papa from 'papaparse';

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

type MappedRow = {
  [key: string]: any;
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
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [columnMappings, setColumnMappings] = useState<{ [key: string]: string }>({});
  const [rawImportedData, setRawImportedData] = useState<any[]>([]);
  const [messageShown, setMessageShown] = useState(true)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  // const message = params.get('message') || error
  // const messageType = params.get('messageType') ? params.get('messageType') : error ? 'bad' : 'good'

  useEffect(() => {
    if (message) {
      setMessageShown(true);
      const timer = setTimeout(() => {
        setMessageShown(false);
        setMessage('');
        setMessageType('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, messageType]);

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
      setData([]);
      Papa.parse(file, {
        complete: (result) => {setRawImportedData(result.data)}, header: true,
      })
    }
  }

  const handleColumnMappingChange = (csvColumn: string, attendeeField: string) => {
    setColumnMappings((prevMappings) => ({...prevMappings, [csvColumn]: attendeeField}))
  }

  const handleImportData = () => {
    const transformedData = rawImportedData.map((row, index) => transformAttendee(row, index, columnMappings));
    setAttendeesData(transformedData)
    setRawImportedData([])
    setColumnMappings({})
  }
  
  const transformAttendee = (row: any, index: number, mappings: { [key: string]: string }) => {
    const mappedRow: MappedRow = Object.keys(mappings).reduce((acc, key) => {
      acc[mappings[key]] = row[key] || ''
      return acc
    }, {});
  
    return {
      index,
      name: mappedRow.name || '',
      email: mappedRow.email || '',
      phone: mappedRow.phone || '',
      passes: mappedRow.passes ? [mappedRow.passes] : [],
      purchased_at: mappedRow.purchased_at || '',
      ticket_number: mappedRow.ticket_number || null,
      active: mappedRow.active !== 'false',
      status: mappedRow.status || 'draft',
      student_ticket: mappings['student_ticket'] ? mappedRow.student_ticket === 'true' : (mappedRow.passes && mappedRow.passes.toLowerCase().includes('student')),

      unit_amount: mappedRow.unit_amount ? Number(mappedRow.unit_amount.substring(1))*100 : 999999999999,
      cs_id: row.cs_id || '',
      checkin_at: row.checkin_at || '',
      transferred_in: false,
      transferred_out: false,
      name_changed: false,
      transferred: null,
      history: [],
    }
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
        attendee.index === updatedAttendee.index ? updatedAttendee : attendee
      )
    )
    console.log(data)
    setIsEditingIndex(null)
  }

  const handleDeleteRow = (indexToDelete: number | null) => {
    const updatedAttendees   = attendeesData.filter((_, index) => index !== indexToDelete)
    const reindexedAttendees = updatedAttendees.map((attendee, newIndex) => ({...attendee, index: newIndex}))

    setIsEditingIndex(null)
    setAttendeesData(reindexedAttendees)
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
    
    const result = await response.json();
    console.log(result.message)

    if (response.ok) {
      setMessage(result.message);
      setMessageType(result.messageType);
      if (response.status === 207 && result.failed_imports && result.failed_imports.length > 0) {
        const failedIndexes = result.failed_imports.map((item) => item.attendee.index);
          attendeesData.forEach((attendee) => {
          if (!failedIndexes.includes(attendee.index)) {
            handleDeleteRow(attendee.index);
          }
        })
      }
    } else {
      setMessage(result.message);
      setMessageType(result.messageType);
      setAttendeesData([])
    }
  }

  const handleBulkEdit = (e: React.FormEvent) => {
    e.preventDefault()

    const formData = new FormData(e.target as HTMLFormElement);
    const passType = formData.get('passType') as string;
    const unitAmount = formData.get('unitAmount') as string;
    const studentTicket = formData.get('studentTicket') === 'true';
    const status = formData.get('status') as string;

    const updatedData = attendeesData.map((attendee) => {
      if (selectedRows.includes(attendee.index)) {
        return {
          ...attendee,
          passes: passType ? [passType] : attendee.passes,
          unit_amount: unitAmount ? parseInt(unitAmount, 10) : attendee.unit_amount,
          student_ticket: studentTicket,
          status: status || attendee.status,
        }
      }
      return attendee
    })

    setAttendeesData(updatedData);
    setSelectedRows([]); 
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
      <div className="bg-gray-800 p-4 rounded-lg mb-4">
        <h2 className="text-lg text-white mb-2">Import Data</h2>
        
        {/* File Upload Input */}
        <input 
          type="file" 
          accept=".csv,.txt" 
          onChange={handleFileUpload} 
          className="block mb-2 w-full text-gray-800"
        />

        {/* Buttons */}
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={handleImportData}
            className="py-2 px-4 bg-green-500 text-white rounded-lg font-semibold mr-2">
            Import
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="py-2 px-4 bg-red-500 text-white rounded-lg font-semibold">
            Reset
          </button>
        </div>

        {/* Mapping Section (only shown after file upload) */}
        {rawImportedData.length > 0 && (
          <div className="mt-4">
            <h3 className="text-md text-white mb-2">Map Imported Columns</h3>
            <form>
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(rawImportedData[0]).map((column, idx) => (
                  <div key={idx} className="flex justify-between items-center mb-2">
                    <label className="text-sm text-gray-300">{column}</label>
                    <select
                      onChange={(e) => handleColumnMappingChange(column, e.target.value)}
                      className="block w-1/2 rounded-md border-gray-300 text-gray-800 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                      <option value="">Unmapped</option>
                      <option value="name">Name</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="passes">Passes</option>
                      <option value="purchased_at">Purchased At</option>
                      <option value="ticket_number">Ticket Number</option>
                      <option value="active">Active</option>
                      <option value="status">Status</option>
                      <option value="student_ticket">Student Ticket</option>
                      <option value="unit_amount">Unit Amount</option>
                    </select>
                  </div>
                ))}
              </div>
            </form>
          </div>
        )}
      </div>

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
                    className="ml-2 block w-2/3 rounded-md border-gray-300 shadow-sm text-gray-800 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
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
                      className="ml-2 block w-2/3 rounded-md border-gray-300 shadow-sm text-gray-800 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-800 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                      <option value="Full Pass">Full Pass</option>
                      <option value="Artist Pass">Artist Pass</option>
                      <option value="Staff Pass">Staff Pass</option>
                      <option value="Full Pass (without dinner)">Full Pass (without dinner)</option>
                      <option value="Volunteer Pass (without dinner)">Volunteer Pass (without dinner)</option>
                      <option value="Artist Pass (without dinner)">Artist Pass (without dinner)</option>
                      <option value="Party Pass">Party Pass</option>
                      <option value="Saturday Pass">Saturday Pass</option>
                      <option value="Sunday Pass">Sunday Pass</option>
                      <option value="Class Pass<">Class Pass</option>
                      <option value="Saturday - Party">Saturday - Party</option>
                      <option value="Saturday - Class">Saturday - Class</option>
                      <option value="Saturday - Dinner">Saturday - Dinner</option>
                      <option value="Friday - Party">Friday - Party</option>
                      <option value="Sunday - Party">Sunday - Party</option>
                      <option value="Sunday - Class">Sunday - Class</option>
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-800 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                      <option value="">Select Status</option>
                      <option value="paid_stripe">Paid Online</option>
                      <option value="paid_cash">Paid Cash</option>
                      <option value="gratis">Free Ticket</option>
                    </select>
                  </label>

                  <label className="block text-sm font-medium text-gray-300 col-span-2 m-1 mt-3">
                    Student Ticket
                    <select
                      name="studentTicket"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-800 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                      <option value="">Select Status</option>
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  </label>
                  <div className="col-span-2 mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-400 mr-2">Selected Rows: {selectedRows.length}</span>
                        <button
                          type="button"
                          onClick={deselectAll}
                          className="text-xs text-blue-400 underline mr-2">
                          Deselect All
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedRows(attendeesData.map((row) => row.index))}
                          className="text-xs text-blue-400 underline">
                          Select All
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="py-2 px-4 bg-blue-500 text-white rounded-lg font-semibold shadow-sm">
                        Apply Bulk Edit
                      </button>
                    </div>
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