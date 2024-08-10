'use client'
import { useUser } from "@clerk/clerk-react";
import {
  NewspaperIcon,
  TicketIcon,
  ArrowLeftEndOnRectangleIcon,
  // CalendarDaysIcon,
  ShoppingCartIcon,
  CakeIcon,
  LightBulbIcon
} from '@heroicons/react/24/solid'

const actions = [
  {
    title: 'Content Management',
    href: '/admin/content',
    description: "Website editing and general look of the place",
    icon: NewspaperIcon,
    iconForeground: 'text-teal-700',
    iconBackground: 'bg-teal-200',
    state: 'live',
  },
  {
    title: 'Attendees',
    href: '/admin/ticketing?sortByField=purchased_date&sortByDirection=asc&filter=active:true',
    description: "Tickets, passes for the event",
    icon: TicketIcon,
    iconForeground: 'text-purple-700',
    iconBackground: 'bg-purple-200',
    state: 'live'
  },
  {
    title: 'Users',
    href: '/admin/users',
    description: "Backend user admin",
    icon: LightBulbIcon,
    iconForeground: 'text-gray-700',
    iconBackground: 'bg-gray-300',
    state: 'live',
  },
  {
    title: 'Sign people in',
    href: '/admin/scan',
    description: "On the day(s) signing people into the event",
    icon: ArrowLeftEndOnRectangleIcon,
    iconForeground: 'text-blue-700',
    iconBackground: 'bg-blue-200',
    state: 'live',
  },
  // {
  //   title: 'Class / Session Planner',
  //   href: '#',
  //   description: "Class or session times and teachers ",
  //   icon: CalendarDaysIcon,
  //   iconForeground: 'text-yellow-800',
  //   iconBackground: 'bg-yellow-200',
  //   state: 'unreleased',
  // },
    {
    title: 'Till',
    href: '/admin/epos',
    description: "Take money on or before the day",
    icon: ShoppingCartIcon,
    iconForeground: 'text-yellow-800',
    iconBackground: 'bg-yellow-200',
    state: 'live',
  },
  {
    title: 'Dining Information',
    href: '#',
    description: "Meal information and seating plans",
    icon: CakeIcon,
    iconForeground: 'text-green-800',
    iconBackground: 'bg-green-200',
    state: 'unreleased',
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Hub() {
  const { user, isLoaded } = useUser();
  if (!isLoaded) { return <div>Loading</div> }
  if (!user) { return <div>Not logged in</div> }
  
  return user.publicMetadata.admin ? (
    <div className="divide-x divide-richblack-700 border border-richblack-700 overflow-hidden rounded-lg shadow sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 sm:gap-px  text-white mt-6">
      {actions.map((action, actionIdx) => (
        <div
          key={action.title}
          className={classNames( //TODO this is an absolute shitshow and need better working, shame on tailwind components
            actionIdx === 0 ? 'rounded-tl-lg rounded-tr-lg sm:rounded-tr-none border-b' : '',
            actionIdx === 1 ? 'sm:rounded-tr-lg lg:rounded-none border-b' : '',
            actionIdx === 2 ? 'lg:rounded-tr-lg border-b' : '',
            actionIdx === 3 ? 'lg:rounded-tr-lg lg:border-b-none ' : '',
            actionIdx > 3 ? 'lg:rounded-tr-lg lg:border-b-none' : '',
            actionIdx === actions.length - 3 ? 'lg:rounded-bl-lg' : '',
            actionIdx === actions.length - 2 ? 'sm:rounded-bl-lg lg:rounded-none' : '',
            actionIdx === actions.length - 1 ? 'rounded-bl-lg rounded-br-lg sm:rounded-bl-none' : '',
            'group relative bg-richblack-500 p-6 focus-within:ring-2  focus-within:ring-inset focus-within:ring-chillired-500 border-b border-richblack-700 ',
          )}
        >
          <div className='flex'>
            {action.state != 'live' ? <div className='absolute top-0 left-0 w-full h-full  '>
              { action.state != 'demo' ? <div className='absolute top-0 left-0 w-full h-full bg-black opacity-60'></div>: null} 
              <div className='flex absolute w-full h-full items-center justify-end pr-10 text-xl  font-bold text-gray-300 '><span className='bg-black px-4 py-2 rounded-full'>{action.state}</span></div>
            </div> : null}
            <div className='mr-6'>
              <span
                className={classNames(
                  action.iconBackground,
                  action.iconForeground,
                  'inline-flex rounded-lg p-3',
                )}
              >
                <action.icon aria-hidden="true" className="h-12 w-12" />
              </span>
            </div>

            <div className="mt-0">
              <h3 className="text-base font-semibold leading-6 text-white">
                <a href={action.href} className="focus:outline-none">
                  {/* Extend touch target to entire panel */}
                  <span aria-hidden="true" className="absolute inset-0" />
                  {action.title}
                </a>
              </h3>
              <p className="mt-2 text-sm text-gray-200">
                {action.description}
              </p>
            </div>

          </div>
          
          
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-6 top-6 text-gray-400 group-hover:text-white"
          >
            <svg fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6">
              <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
            </svg>
          </span>
        </div>
      ))}
    </div>
  ) : <div>Either we&apos;re prepping your access now or you&apos;re a cheeky monkey!</div>
}
