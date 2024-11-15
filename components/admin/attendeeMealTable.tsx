'use client'
import React, { useState } from "react";

const courseMappings = [
  { 0: "Vegetable Terrine", 1: "Chicken Liver Pate" },
  { 0: "Roasted Onion", 1: "Fish and Prawn Risotto", 2: "Chicken Supreme" },
  { 0: "Fruit Platter", 1: "Bread and Butter Pudding" }
];

export default function AttendeeMealTable({ attendees, summaryLoading, summaryError, itemsPerPage = 25 }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const totalPages = attendees ? Math.ceil(attendees.length / itemsPerPage) : 1;

  const attendeesToDisplay = attendees ? attendees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) : [];

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div
        className={`flex justify-between items-center bg-richblack-700 text-white px-4 py-3 ${isCollapsed ? "rounded-md": "rounded-t-md"} cursor-pointer`}
        onClick={() => setIsCollapsed(!isCollapsed)}>
        <h1 className="text-xl font-bold">Attendees with Dinner</h1>
        <span className={`transform transition-transform ${isCollapsed ? '' : 'rotate-90'}`}>›</span>
      </div>

      {!isCollapsed && (
        <div className="bg-richblack-700 rounded-b-md p-4">
          <div className="flex justify-end items-center mb-2">
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

          <div className="mt-4 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="py-4 pl-4 pr-3 text-left text-lg font-bold text-gray-100 sm:pl-0">
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
                    {summaryLoading || summaryError ? <p>Loading..</p> : attendeesToDisplay.map((attendee, index) => {
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
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}