'use client'
import React, { useState } from "react";

const courseMappings = [
  { 0: "Vegetable Terrine", 1: "Chicken Liver Pate" },
  { 0: "Roasted Onion", 1: "Fish and Prawn Risotto", 2: "Chicken Supreme" },
  { 0: "Fruit Platter", 1: "Bread and Butter Pudding" }
];

export default function AttendeeMealTable({ attendees, summaryLoading, summaryIsValidating, summaryError, itemsPerPage = 25, attendeesGroupedByTable = false }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = attendees ? Math.ceil(attendees.length / itemsPerPage) : 1;

  const attendeesToDisplay = attendees ? attendees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) : [];

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }

  return (
        <div className={`${!attendeesGroupedByTable ? 'bg-richblack-700' : ''} rounded-b-md`}>
          <div className="grid grid-cols-2">
          {!attendeesGroupedByTable ? 
            <div className=" flex justify-start mb-2">
              <div className="overflow-hidden">
                <a href="/admin/meal/details">
                  <button className="px-8 py-1 text-sm bg-chillired-500 text-white rounded-md mr-2">Full Details</button>
                </a>
              </div>               
            </div>
            : <div className=" flex justify-start mb-2"></div>}
            <div className="flex justify-end items-center mb-2">
              {summaryIsValidating ? 
                <div role="status" className='flex'>
                  <svg aria-hidden="true" className="w-4 h-4 me-2 text-gray-200 animate-spin dark:text-gray-600 fill-chillired-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
                  <span className="">Refreshing...</span>
                </div> : null
              }
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-2 py-1 text-sm ${currentPage === 1 ? 'bg-richblack-500 cursor-not-allowed' : 'bg-chillired-500'} text-white rounded-md mr-2`}>
                Previous
              </button>
              <span className="text-xs text-gray-500">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-2 py-1 text-sm ${currentPage === totalPages ? 'bg-richblack-500 cursor-not-allowed' : 'bg-chillired-500'} text-white rounded-md ml-2`}>
                Next
              </button>
            </div>
          </div>            

          <div className="mt-4 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-richblack-700">
                    <tr>
                      <th scope="col" className="py-4 pl-4 pr-3 text-left text-lg font-bold text-gray-100">
                        Name
                      </th>
                      <th scope="col" className="px-3 py-4 text-left text-lg font-bold text-gray-100">
                        Starter
                      </th>
                      <th scope="col" className="px-3 py-4 text-left text-lg font-bold text-gray-100">
                        Main
                      </th>
                      <th scope="col" className="px-3 py-4 text-left text-lg font-bold text-gray-100">
                        Dessert
                      </th>
                      <th scope="col" className="px-3 py-4 text-left text-lg font-bold text-gray-100">
                        Dietary Requirements
                      </th>
                      <th scope="col" className="px-3 py-4 text-left text-lg font-bold text-gray-100">
                        Other
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-700">
                    {summaryLoading || summaryError ? (
                      <p>Loading..</p>
                    ) : attendeesGroupedByTable ? (
                      attendeesToDisplay.map((tableGroup, tableIndex) => (
                        [
                          <tr key={`table-index-${tableIndex}`}>
                            <td colSpan={6} className="whitespace-nowrap px-1 py-3 pt-8 text-s text-gray-100 bg-richblack-600/70">
                              Table {tableIndex + 1}
                            </td>
                          </tr>,
                          ...tableGroup.map((attendee, index) => {
                            const baseClasses = "whitespace-nowrap px-1 py-3 text-xs text-gray-100 ";
                            const choices = attendee.choices || [];
    
                            return (
                              <tr
                                key={index}
                                className={`${attendee.not_wanted ? 'decoration-1 line-through text-gray-600' : ''} ${attendee.is_selected ? '' : 'bg-yellow-900/20'}`}>
                                <td className={baseClasses}>{attendee.full_name}</td>
                                <td className={baseClasses}>{courseMappings[0][choices[0]] || courseMappings[0][0]}</td>
                                <td className={baseClasses}>{courseMappings[1][choices[1]] || courseMappings[1][0]}</td>
                                <td className={baseClasses}>{courseMappings[2][choices[2]] || courseMappings[2][0]}</td>
                                <td className={baseClasses}>{attendee.dietary_requirements?.selected?.join(", ") || " - "}</td>
                                <td className={baseClasses}>{attendee.dietary_requirements?.other || " - "}</td>
                              </tr>
                            )
                          })                    
                        ]
                      ))
                    ) : (
                      attendeesToDisplay.map((attendee, index) => {
                        const baseClasses = "whitespace-nowrap px-1 py-3 text-xs text-gray-100 ";
                        const choices = attendee.choices || [];

                        return (
                          <tr key={index} className={`${attendee.not_wanted ? 'decoration-1 line-through text-gray-600' : ''} ${attendee.is_selected ? '' : 'bg-yellow-900/20'}`}>
                            <td className={baseClasses}>{attendee.full_name}</td>
                            <td className={baseClasses}>{courseMappings[0][choices[0]] || courseMappings[0][0]}</td>
                            <td className={baseClasses}>{courseMappings[1][choices[1]] || courseMappings[1][0]}</td>
                            <td className={baseClasses}>{courseMappings[2][choices[2]] || courseMappings[2][0]}</td>
                            <td className={baseClasses}>{attendee.dietary_requirements?.selected?.join(", ") || "None"}</td>
                            <td className={baseClasses}>{attendee.dietary_requirements?.other || "None"}</td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
  );
}