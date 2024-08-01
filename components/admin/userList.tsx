'use client'
import useSWR, {useSWRConfig} from "swr";
import { EnvelopeIcon, ClockIcon } from '@heroicons/react/20/solid'
import { format } from "date-fns";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UserList({loggedInUser}) {
  const { mutate } = useSWRConfig()
  const {data, error, isLoading, isValidating} = useSWR("/api/admin/users", fetcher);
  const users = data?.users
  if(isLoading) { return <p>Loading...</p> }
  else if (isValidating) { return <p>Validating...</p>} 
  else if (error) { return <p>Error {JSON.stringify(error)}</p> }
  else {
  return (
    <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {users && users.map((user) => { return (<Card key={user.id} person={user} mutate={mutate} loggedInUser={loggedInUser}/>)})}
    </ul>
    )
  }
}

  const setPermission = async (userId,permission,setTo) => {
    console.log(userId)
    const apiResponse = await fetch(`/api/users`,{
      method: 'POST',
      body: JSON.stringify({userId: userId, permission: permission, value: setTo}),
    })
    console.log(apiResponse)
  }

  const Card = ({person,mutate,loggedInUser}) => {
    console.log("person:",person)
    const admin = person.metadata?.public?.admin;
    const title = person.metadata?.public?.title;
    const isMe = person.id === loggedInUser
    return (<li
          key={person.email}
          className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow"
        >
                    {/* <pre className="text-black">{JSON.stringify(person,null,2)}</pre> */}

          <div className="flex flex-1 flex-col p-8">
            <img alt="" src={person.imageUrl} className="mx-auto h-32 w-32 flex-shrink-0 rounded-full" />
            <h3 className="mt-6 text-sm font-medium text-gray-900">{person.firstName} {person.lastName}</h3>
            <dl className="mt-1 flex flex-grow flex-col justify-between">
              <dt className="sr-only">Title</dt>
              <dd className="text-sm text-gray-500">{title}</dd>
              <dt className="sr-only">Role</dt>
              <dd className="mt-3">
                <span className={`inline-flex items-center rounded-full 
                  ${ admin ? "bg-green-50 text-green-700 ring-green-600/20" : "bg-blue-50 text-blue-700 ring-blue-600/20"}
                  px-3 pb-0 pt-1 text-xs font-medium  ring-1 ring-inset `}>
                  {admin ? "Admin" : "User"}
                </span>
              </dd>
            </dl>
          </div>
          <div>
            <div className="-mt-px flex divide-x divide-gray-200">
              <div className="flex w-0 flex-1">
                <a
                  href={`mailto:${person.email}`}
                  className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                >
                  <EnvelopeIcon aria-hidden="true" className="h-5 w-5 text-gray-400" />
                  Email
                </a>
              </div>
              <div className="-ml-px flex w-0 flex-1">
                { isMe ? <div className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900">
                  This is you
                </div>
                :<button
                  onClick={() => {setPermission(person.id,"admin",!admin); setTimeout(() => mutate("/api/users"),600)}}
                  className="hover:text-red-600 relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                >
                  {admin ? "Revoke Admin" : "Make Admin"}
                </button>
                }
                
              </div>
              <div className="-ml-px flex w-0 flex-1">
                <span
                  className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm text-gray-900"
                >
                  <ClockIcon aria-hidden="true" className="h-5 w-5 text-gray-400" />
                  {format(person.lastActiveAt,"dd/MM HH:mm")}
                </span>
              </div>
            </div>
          </div>
        </li>)
  }