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
      <div className="mt-8 flow-root">
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
                  <td className={`${baseClasses} font-bold`}>Not Selected Count</td>
                  <td className={baseClasses}>{stats.not_selected_count}</td>
                </tr>
                <tr>
                  <td className={`${baseClasses} font-bold`}>Incomplete Count</td>
                  <td className={baseClasses}>{stats.incomplete_count}</td>
                </tr>
                <tr>
                  <td className={`${baseClasses} font-bold`}>Not Wanted Count</td>
                  <td className={baseClasses}>{stats.not_wanted_count}</td>
                </tr>
                <tr>
                  <td className={`${baseClasses} font-bold`}>Selected Count</td>
                  <td className={baseClasses}>{stats.selected_count}</td>
                </tr>

                <tr>
                  <td colSpan={2} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-100 bg-richblack-600/70">
                    Course Frequencies
                  </td>
                </tr>
                {stats?.course_frequencies?.map((course, courseIndex) => (
                  [
                    ...Object.entries(course).map(([key, value]) => (
                      <tr key={`course-${courseIndex}-${key}`}>
                        <td className={`${baseClasses}`}>{key}</td>
                        <td className={baseClasses}>{String(value)}</td>
                      </tr>
                    )),
                    <tr key={`blank-row-${courseIndex}`}>
                      <td colSpan={2} className="py-2"></td>
                    </tr>
                  ]
                ))}

                <tr>
                  <td colSpan={2} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-100 bg-richblack-600/70">
                    Dietary Frequencies
                  </td>
                </tr>
                {Object.entries(stats?.dietary_frequencies || {}).map(([key, value]) => (
                  <tr key={`dietary-${key}`}>
                    <td className={`${baseClasses} font-bold`}>{key}</td>
                    <td className={baseClasses}>{String(value)}</td>
                  </tr>
                ))}
              </tbody>            
            </table>
          </div>
        </div>
      </div>
    }
  </>)
}