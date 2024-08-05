import { BiCreditCard, BiLogoSketch, BiLeftArrowCircle, BiSolidRightArrowSquare } from 'react-icons/bi';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { EllipsisVerticalIcon, CurrencyPoundIcon, ClipboardIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid'
import { format } from 'date-fns';

const TicketStatusIcon = ({attendee})  => {
  const PaymentIcon = attendee.status === 'paid_stripe' ? <BiCreditCard title="Paid Online" className='w-6 h-6' /> 
    : attendee.status === 'paid_cash' ? <CurrencyPoundIcon title="Paid Cash" className='w-6 h-6' /> :
      attendee.status === 'gratis' ? <BiLogoSketch title="Free Ticket" className='w-6 h-6' /> : null //TODO should have a icon for wtf paid for this
  const trasnferOutIcon = attendee.transferred_out ? <BiSolidRightArrowSquare title={`Transferred to ${attendee.transferred_out}`} className='w-6 h-6' /> : null
  const transferInIcon =  attendee.transferred_in ? <BiLeftArrowCircle title={`Transferred from ${attendee.transferred_in}`} className='w-6 h-6' /> : null
  const namechangeIcon = attendee.name_changed ? <ClipboardIcon className='w-6 h-6' /> : null
  const wtfIcon = attendee.transferred_in && attendee.transferred_out ? <ExclamationTriangleIcon className='w-6 h-6' /> : null
  return <span className='flex'>{PaymentIcon}{trasnferOutIcon}{transferInIcon}{namechangeIcon}{wtfIcon}</span>
}

export const TicketRow = ({attendee,setActiveTicket, setNameChangeModalActive, setTicketTransferModalActive}) => {
  const passString = attendee.passes.join(', ')
  return (
    <tr key={`${attendee.ticket_number}`} className={`align-center ${attendee.active ? '' : 'decoration-1	 line-through text-gray-600'}`}>
      <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm  font-medium sm:w-auto sm:max-w-none sm:pl-2 vertical-align-top">
        <a href="#" className={`${attendee.active ? 'text-chillired-600 hover:text-chillired-700' : "text-gray-600"}`}>
          <span className="text-lg leading-6 sm:text-base md:text-base">{attendee.name}</span><br/>
          <span className="text-xs leading-6 text-gray-300">#{attendee.ticket_number}</span>
        </a>
        <dl className="font-normal lg:hidden text-inherit">
          <dt className="sr-only">Email</dt>
          <dd className="mt-1 truncate text-inherit">{attendee.email}</dd>
          <dt className="sr-only sm:hidden">Passes</dt>
          <dd className="mt-1 truncate text-inherit sm:hidden">{passString}</dd>
          <dt className="sr-only sm:hidden">Status</dt>
          <dd className="mt-1 truncate text-inherit sm:hidden"><TicketStatusIcon attendee={attendee}/>
          </dd>
        </dl>
      </td>
      <td className="hidden px-3 py-4 text-sm text-inherit lg:table-cell">{attendee.email}</td>
      <td className="hidden px-3 py-4 text-sm text-inherit sm:table-cell">{passString}</td>
      <td className="px-3 py-4 text-sm text-gray-200 text-nowrap align-center">
        {attendee.checkin_at ? format(attendee.checkin_at,'EEE HH:mm') :  <button className='bg-green-700 rounded-full px-4 py-1'>Check in</button>}
      </td>
      <td className='hidden sm:table-cell px-3 py-0 text-xl align-middle'>
        <TicketStatusIcon attendee={attendee}/>
      </td>
      <td className='px-3 py-0 text-xl align-middle'>
        <Menu as="div" className="relative flex flex-col h-full justify-center items-center">
          <MenuButton className="-m-2.5 block p-2.5 text-chillired-400 hover:text-chillired-800 h-full">
            <span className="sr-only">Open options</span>
            <EllipsisVerticalIcon aria-hidden="true" className="h-5 w-5" />
          </MenuButton>
          <MenuItems
            transition
            className="absolute right-0 z-10 mt-2 w-44 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
          >
            <MenuItem>
              <a href="#" className="block px-3 py-1 text-sm leading-6 text-gray-900 data-[focus]:bg-gray-50">
                View<span className="sr-only">, {attendee.name}</span>
              </a>
            </MenuItem>
            <MenuItem>
              { attendee.active ? (
                <a href="#" className="block px-3 py-1 text-sm leading-6 text-gray-900 data-[focus]:bg-gray-50"
                  onClick={() => { setActiveTicket(attendee); setTicketTransferModalActive(true) }}
                >
                Transfer<span className="sr-only"> {attendee.name}&apos;s ticket</span>
              </a>) : <span className='line-through block px-3 py-1 text-sm leading-6 text-gray-300 data-[focus]:bg-gray-50'>Transfer</span> }
            </MenuItem>
            <MenuItem>
              { attendee.active ? (
                <a href="#" className="block px-3 py-1 text-sm leading-6 text-gray-900 data-[focus]:bg-gray-50"
                  onClick={() => { setActiveTicket(attendee); setNameChangeModalActive(true) }}
                >
                Change Name<span className="sr-only"> from {attendee.name}</span>
              </a>) : <span className='line-through block px-3 py-1 text-sm leading-6 text-gray-300 data-[focus]:bg-gray-50'>Change Name</span> }
            </MenuItem>
            <MenuItem>
              <a href="#" className="block px-3 py-1 text-sm leading-6 text-gray-900 data-[focus]:bg-gray-50">
                Meal Preferences<span className="sr-only">, {attendee.name}</span>
              </a>
            </MenuItem>
            <MenuItem>
              <a href="#" className="block px-3 py-1 text-sm leading-6 text-gray-900 data-[focus]:bg-gray-50">
                Resend Email<span className="sr-only">, {attendee.name}</span>
              </a>
            </MenuItem>
          </MenuItems>
        </Menu>
      </td>
      
    </tr>
  )
}