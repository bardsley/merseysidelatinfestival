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

export const TicketRow = ({attendee, handleSaveChanges}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedAttendee, setEditedAttendee] = useState(attendee);
  const handleEdit = () => setIsEditing(!isEditing);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedAttendee({...editedAttendee, [name]: value});
  };

  const handleSave = () => {
    setIsEditing(false);
    handleSaveChanges(editedAttendee);
  };
  
  const passString = attendee.passes.join(', ')
  return (
    <tr key={`${attendee.ticket_number}`} className={`align-center ${attendee.active ? '' : 'decoration-1	 line-through text-gray-600'}`}>
      <td className="w-full max-w-0 py-3 pl-4 pr-3 text-sm  font-medium sm:w-auto sm:max-w-none sm:pl-2 vertical-align-top">
        {isEditing ? (
          <input 
            type="text"
            name="name"
            defaultValue={attendee.name}
            onChange={handleChange}
            className={`block rounded-md border-0 py-1.5 my-2.5 pr-10 ring-1 ring-inset focus:ring-2 focus:ring-inset text-gray-900 sm:text-sm sm:leading-6 max-w-full`}
          />
        ) : (
          <div>
            <span className="text-chillired-600 text-lg leading-6 sm:text-base md:text-base">{attendee.name}</span>
            <br/>
            <span className="text-xs leading-6 text-gray-300">
              #{attendee.ticket_number ? attendee.ticket_number : <em> will be generated on import</em>}
            </span>
          </div>
        )}
      </td>
      <td className="w-full max-w-0 py-3 pl-4 pr-3 text-sm  font-medium sm:w-auto sm:max-w-none sm:pl-2 vertical-align-top">
        {isEditing ? (
          <input 
            type="text"
            name="email"
            defaultValue={attendee.email}
            onChange={handleChange}
            className={`align-middle block rounded-md border-0 py-1.5 my-2.5 ring-1 ring-inset focus:ring-2 focus:ring-inset text-gray-900 sm:text-sm sm:leading-6 w-full`}
          />
        ) : (
          <td className="hidden px-3 py-4 text-sm text-inherit lg:table-cell">{attendee.email}</td>
        )}
      </td>
      <td className="w-full max-w-0 py-3 pl-4 pr-3 text-sm  font-medium sm:w-auto sm:max-w-none sm:pl-2 vertical-align-top">
        {isEditing ? (
          <input 
            type="text"
            name="phone"
            defaultValue={attendee.phone}
            onChange={handleChange}
            className={`align-middle block rounded-md border-0 py-1.5 my-2.5 ring-1 ring-inset focus:ring-2 focus:ring-inset text-gray-900 sm:text-sm sm:leading-6 w-full`}
          />
        ) : (
          <td className="hidden px-3 py-4 text-sm text-inherit lg:table-cell">{attendee.phone}</td>
        )}
      </td>
      <td className="hidden px-3 py-4 text-sm text-inherit sm:table-cell">{passString}</td>
      <td className="w-full max-w-0 py-3 pl-4 pr-3 text-sm  font-medium sm:w-auto sm:max-w-none sm:pl-2 vertical-align-top">
        {isEditing ? (
          <input 
            type="number"
            name="unit_amount"
            defaultValue={attendee.unit_amount}
            onChange={handleChange}
            className={`align-middle block rounded-md border-0 py-1.5 my-2.5 ring-1 ring-inset focus:ring-2 focus:ring-inset text-gray-900 sm:text-sm sm:leading-6 w-28`}
          />
        ) : (
          <td className="hidden px-3 py-4 text-sm text-inherit lg:table-cell">£{attendee.unit_amount/100}</td>
        )}
      </td>

      {isEditing ? (
        <Select name="status" onChange={handleChange} defaultValue={attendee.status} className={`align-middle block rounded-md border-0 py-1.5 my-6 ring-1 ring-inset focus:ring-2 focus:ring-inset text-gray-900 sm:text-sm sm:leading-6`}>
          <option value="paid_stripe">Paid Online</option>
          <option value="paid_cash">Paid Cash</option>
          <option value="gratis">Free Ticket</option>
        </Select>
      ) : (
        <td className='hidden sm:table-cell px-3 py-0 text-xl align-middle'>
          <TicketStatusIcon attendee={attendee}/>
        </td>
      )}
      
      <td className='px-3 py-0 text-xl align-middle'>
        {isEditing ? (
          <Button onClick={handleSave} className="inline-flex items-center gap-2 rounded-md bg-gray-100 py-1.5 px-2.5 text-sm/6 font-semibold text-gray-900 shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[hover]:text-white data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white">
            Save
          </Button>
        ) : (
          <Button onClick={handleEdit} className="inline-flex items-center gap-2 rounded-md bg-chillired-700 py-1.5 px-3.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white">
            Edit
          </Button>
        )}
      </td>
      
    </tr>
  )
}