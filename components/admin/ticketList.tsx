import {format } from 'date-fns'

const shuffle = (array: any[]) => { 
  for (let i = array.length - 1; i > 0; i--) { 
    const j = Math.floor(Math.random() * (i + 1)); 
    [array[i], array[j]] = [array[j], array[i]]; 
  } 
  return array; 
}; 

export default function TicketList() {

  const people = shuffle([
    { name: 'Arnold Swarzenegger', email: 'arnie@gmail.com', signed_in: '2024-11-29T19:06:00.000Z', passes: ['Party Pass', 'Saturday Classes'] },
    { name: 'Jonathon Walton', email: 'Jonathon.walton@reallylongemail.com', signed_in: '2024-11-29T19:26:00.000Z', passes: ['Saturday Pass'] },
    { name: 'Sarah Marshal', email: 'ihate@sarahmarshal.com', signed_in: '2024-11-30T10:00:00.000Z', passes: ['Full Pass'] },
    { name: 'Lindsay Lohan', email: 'lindsay.havinfun@partyallnight.com', signed_in: '2024-12-01T12:00:00.000Z', passes: ['Class Pass', 'Dinner and Dine Pass'] },
    { name: 'Big Al', email: 'idance.on.tuesdays@thatplace.com', signed_in: null, passes: ['Class Pass', 'Dinner and Dine Pass'] },
    // More people...
  ])

  return (
    <div className="px-0">
      
      <div className="-mx-4 sm:mx-0 mt-8">
        <table className="min-w-full divide-y divide-richblack-600">
          <thead className="bg-richblack-600">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-2">
                Name <span className='sm:hidden'> & Details</span><span className='hidden sm:inline lg:hidden'>& Email</span>
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-white lg:table-cell"
              >
                Email
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-white sm:table-cell"
              >
                Passes
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white flex flex-col items-center">
                Sign in?
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-none">
            {people.map((person) => { 
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
