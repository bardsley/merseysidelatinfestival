'use client'
import React, { useState } from "react";
import useSWR from "swr";
import { fetcher } from  "@lib/fetchers";

export default function MealStatsTable() {
  const {data, error, isLoading} = useSWR("/api/admin/meal/summary", fetcher, { keepPreviousData: false });

  const stats = data.statistics

  const baseClasses = "whitespace-nowrap px-1 py-3 text-xs text-gray-100 "

  return (<>
    {isLoading || error ? (
      <p>Loading..</p>
    ) :
      <div className="mt-8 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {/* Summary Statistics Table */}
        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-richblack-700">
                  <tr>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-100">
                      Summary Statistics
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-100">
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className={`${baseClasses}`}>Not Selected Count</td>
                    <td className={baseClasses}>{stats.not_selected_count}</td>
                  </tr>
                  <tr>
                    <td className={`${baseClasses}`}>Incomplete Count</td>
                    <td className={baseClasses}>{stats.incomplete_count}</td>
                  </tr>
                  <tr>
                    <td className={`${baseClasses}`}>Not Wanted Count</td>
                    <td className={baseClasses}>{stats.not_wanted_count}</td>
                  </tr>
                  <tr>
                    <td className={`${baseClasses}`}>Selected Count</td>
                    <td className={baseClasses}>{stats.selected_count}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Course Frequencies Table */}
        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-richblack-700">
                  <tr>
                    <th colSpan={2} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-100">
                      Course Frequencies
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.course_frequencies.map((course, courseIndex) => (
                    [
                      ...Object.entries(course).map(([key, value]) => (
                        <tr key={`course-${courseIndex}-${key}`}>
                          <td className={`${baseClasses}`}>{key}</td>
                          <td className={baseClasses}>{String(value)}</td>
                        </tr>
                      )),
                      <tr key={`divider-${courseIndex}`}>
                        <td colSpan={2} className=""></td>
                      </tr>                  
                    ]
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Dietary Frequencies Table */}
        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-richblack-700">
                  <tr>
                    <th colSpan={2} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-100">
                      Dietary Frequencies
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(stats.dietary_frequencies || {}).map(([key, value]) => (
                    <tr key={`dietary-${key}`}>
                      <td className={`${baseClasses}`}>{key.replace("-", " ")}</td>
                      <td className={baseClasses}>{String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    }
  </>)
}