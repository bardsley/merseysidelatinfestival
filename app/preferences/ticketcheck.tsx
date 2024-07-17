'use client'
export default function TicketCheck() {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center p-6 my-6 md:my-12 lg:px-8 border rounded-lg ">
    
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-4 text-center text-2xl font-bold leading-9 tracking-tight text-white">
          Add you ticket details below
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form action="/api/session" method="POST" encType="multipart/form-data" className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-white">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
              />
            </div>
            <p id="ticket-description" className="mt-2 text-sm text-gray-300">
              The one used to purchase your ticket or pass
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-white">
                Ticket Number
              </label>
              <div className="text-sm">
                <a href="#" className="font-semibold text-indigo-400 hover:text-indigo-300">
                  Resend Ticket Email
                </a>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="ticket"
                name="ticket"
                type="text"
                required
                className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
              />
            </div>
            <p id="ticket-description" className="mt-2 text-sm text-gray-300">
              We sent it to your email when you signed up
            </p>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-auto mx-auto justify-center  rounded-md bg-chillired-500 px-3 md:px-6 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              Confirm Ticket Ownership
            </button>
          </div>
        </form>        
      </div>
    </div>
  )
}