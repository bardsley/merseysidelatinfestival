'use client'
import { Formik, Form } from 'formik';
import FormField from '../forms/FormField';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { FlagIcon } from '@heroicons/react/24/solid'

export default function TicketTransferModal({ticket,open,onClose,refreshFunction}) {
  
  return (
    <Formik
       initialValues={{ ticket_number: ticket.ticket_number, name: ticket.name, phone: ticket.phone, email: ticket.email, }}
       onSubmit={async (values, { setSubmitting }) => {
        const bodyData = {
          ticket_number: ticket.ticket_number,
          email: ticket.email,
          replace: {
            name: values.name,
            email: values.email,
            phone: values.phone,
          }
        }
        console.log(bodyData)
        const apiResponse = await fetch("/api/ticket/update",{
          method: "POST",
          body: JSON.stringify(bodyData),
        })
        const data = await apiResponse.json()
        setSubmitting(false);
        console.log(bodyData,data);
        onClose(false)
        refreshFunction()
       }}
     >
    {({ isSubmitting }) => (
    <Dialog open={open} onClose={onClose} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />
    
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            
            <Form>
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <FlagIcon aria-hidden="true" className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <DialogTitle as="h3" className="text-base font-semibold leading-6 text-gray-900">
                  Transfer Ticket
                </DialogTitle>
                <FormField field="name" label="New Name"/>
                <FormField field="email" label="New Email"/>
                <FormField field="phone" label="New Phone"/>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
              >
                Transfer
              </button>
              <button
                data-autofocus
                disabled={isSubmitting}
                onClick={() => onClose(false)}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
              >
                Cancel
              </button>
            </div>
            </Form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
    )}
    </Formik>
  )
}

