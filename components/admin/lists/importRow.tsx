import { BiCreditCard, BiLogoSketch, BiLeftArrowCircle, BiSolidRightArrowSquare, } from 'react-icons/bi';
import {Button, Select} from '@headlessui/react'
import {CurrencyPoundIcon, ClipboardIcon, ExclamationTriangleIcon, AcademicCapIcon} from '@heroicons/react/24/solid'
import { useState } from 'react';

const TicketStatusIcon = ({attendee})  => {
  const PaymentIcon = attendee.status === 'paid_stripe' ? <BiCreditCard title="Paid Online" className='w-6 h-6' /> 
    : attendee.status === 'paid_cash' ? <CurrencyPoundIcon title="Paid Cash" className='w-6 h-6' /> :
      attendee.status === 'gratis' ? <BiLogoSketch title="Free Ticket" className='w-6 h-6' /> : null //TODO should have a icon for wtf paid for this
  const trasnferOutIcon = attendee.transferred_out ? <BiSolidRightArrowSquare title={`Transferred to ${attendee.transferred_out}`} className='w-6 h-6' /> : null
  const transferInIcon =  attendee.transferred_in ? <BiLeftArrowCircle title={`Transferred from ${attendee.transferred_in}`} className='w-6 h-6' /> : null
  const namechangeIcon = attendee.name_changed ? <ClipboardIcon className='w-6 h-6' /> : null
  const studentIcon = attendee.student_ticket ? <AcademicCapIcon className='w-6 h-6 ml-2' /> : null
  const wtfIcon = attendee.transferred_in && attendee.transferred_out ? <ExclamationTriangleIcon className='w-6 h-6' /> : null
  return <span className='flex'>{PaymentIcon}{trasnferOutIcon}{transferInIcon}{namechangeIcon}{wtfIcon}{studentIcon}</span>
}

export const ImportRow = ({attendee, handleSaveChanges, onDelete, isEditing, toggleEdit, isSelected, toggleSelection}) => {
  // const [isEditing, setIsEditing] = useState(false)
  const [editedAttendee, setEditedAttendee] = useState(attendee);
  // const handleEdit = () => setIsEditing(!isEditing);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedAttendee({...editedAttendee, [name]: value});
  };

  const handleSave = () => {
    handleSaveChanges(editedAttendee);
  };
  
  const passString = attendee.passes.join(', ')
  return (
    <>
      {isEditing ? (
      <tr className="bg-gray-100 p-2 rounded-md shadow-lg transition-all">
        <td colSpan={7}>
          <div className="grid grid-cols-4 gap-4 p-2">

            {/* Column 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
                <input
                  type="text"
                  name="name"
                  value={editedAttendee.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Email
                <input type="email"
                  name="email"
                  value={editedAttendee.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Phone
                <input
                  type="tel"
                  name="phone"
                  value={editedAttendee.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </label>                 
            </div>


            {/* Column 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Passes
                <Select name="passes" value={editedAttendee.passes}
                  onChange={(e) => setEditedAttendee({ ...editedAttendee, passes: [e.target.value] })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    <option value="Full Pass">Full Pass</option>
                    <option value="Artist Pass">Artist Pass</option>
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
                </Select>
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Unit Amount
                <input
                  type="number"
                  name="unit_amount"
                  value={editedAttendee.unit_amount}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </label>

            </div>

            {/* Column 3 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
                <Select
                  name="status"
                  value={editedAttendee.status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                  
                  <option value="paid_stripe">Paid Online</option>
                  <option value="paid_cash">Paid Cash</option>
                  <option value="gratis">Free Ticket</option>
                </Select>
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Student Ticket
                <select
                  name="student_ticket"
                  value={editedAttendee.student_ticket ? 'true' : 'false'}
                  onChange={(e) =>
                    setEditedAttendee({ ...editedAttendee, student_ticket: e.target.value === 'true' })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </label>
            </div>

            {/* Save and Delete Buttons */}
            <div className="flex flex-col justify-end items-center">
              <Button onClick={handleSave} className="inline-flex items-center gap-2 rounded-md bg-blue-300 py-1.5 px-3.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white">
                Save
              </Button>
              <Button onClick={onDelete} className="inline-flex items-center gap-2 rounded-md bg-red-700 py-1.5 px-3.5 text-xs/4 font-semibold text-white shadow-inner shadow-white/10 mt-4 focus:outline-none data-[hover]:bg-gray-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white">
                DELETE
              </Button>
            </div>
          </div>
        </td>
      </tr>
      ) : (
        <tr onClick={toggleSelection} key={`${attendee.ticket_number}`} className={`align-center ${attendee.active ? '' : 'decoration-1	 line-through text-gray-600'} ${isSelected ? 'bg-richblack-600' : ''}`}>
          {/* <td>{attendee.index + 1}</td> */}
          <td className="w-full max-w-0 py-3 pl-4 pr-3 text-sm  font-medium sm:w-auto sm:max-w-none sm:pl-2 vertical-align-top">
              <div>
                <span className="text-chillired-600 text-lg leading-6 sm:text-base md:text-base">{attendee.name}</span>
                <br/>
                <span className="text-xs leading-6 text-gray-300">
                  #{attendee.ticket_number ? attendee.ticket_number : <em> will be generated on import</em>}
                </span>
              </div>
          </td>
          <td className="w-full max-w-0 py-3 pl-4 pr-3 text-sm  font-medium sm:w-auto sm:max-w-none sm:pl-2 vertical-align-top">
              <span className="hidden px-3 py-4 text-sm text-inherit lg:table-cell">{attendee.email}</span>
          </td>
          <td className="w-full max-w-0 py-3 pl-4 pr-3 text-sm  font-medium sm:w-auto sm:max-w-none sm:pl-2 vertical-align-top">
              <span className="hidden px-3 py-4 text-sm text-inherit lg:table-cell">{attendee.phone}</span>
          </td>
          <td className="hidden px-3 py-4 text-sm text-inherit sm:table-cell">{passString}</td>
          <td className="w-full max-w-0 py-3 pl-4 pr-3 text-sm  font-medium sm:w-auto sm:max-w-none sm:pl-2 vertical-align-top">
              <span className="hidden px-3 py-4 text-sm text-inherit lg:table-cell">£{attendee.unit_amount/100}</span>
          </td>
            <td className='hidden sm:table-cell px-3 py-0 text-xl align-middle'>
              <TicketStatusIcon attendee={attendee}/>
            </td>
          <td className='px-3 py-0 text-xl align-middle'>
              <Button 
              className="inline-flex items-center gap-2 rounded-md bg-chillired-700 py-1.5 px-3.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white"
              onClick={(e) => {
                e.stopPropagation()
                toggleEdit(attendee.index)
                }}>
                Edit
              </Button>
          </td>
      </tr>
      )}
  </>
  )
}