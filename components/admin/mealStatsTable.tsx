'use client'
import useSWR from "swr";
import { fetcher } from  "@lib/fetchers";

export default function MealStatsTable() {
  const {data: data, error: error, isLoading: isLoading, isValidating: isValidating} = useSWR("/api/admin/meal/summary", fetcher, { keepPreviousData: false });


  const stats = data?.statistics

  const baseClasses = "whitespace-nowrap px-1 py-3 text-xs text-gray-100 "

  return (<>
    {isLoading || error ? (
      <p>Loading..</p>
    ) :
    <div>
      {isValidating ? 
                <div role="status" className='flex'>
                  <svg aria-hidden="true" className="w-4 h-4 me-2 text-gray-200 animate-spin dark:text-gray-600 fill-chillired-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
                  <span className="">Refreshing...</span>
                </div> : null
              }
    <div className="summaries mt-8 grid grid-cols-1 print:flex gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Summary Statistics Table */}
        <div className="flow-root summary-table">
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
                    <td className={`${baseClasses}`}>Not Selected</td>
                    <td className={baseClasses}>{stats.not_selected_count}</td>
                  </tr>
                  <tr>
                    <td className={`${baseClasses}`}>Selected</td>
                    <td className={baseClasses}>{stats.selected_count}</td>
                  </tr>
                  <tr>
                    <td className={`${baseClasses}`}>Incomplete </td>
                    <td className={baseClasses}>{stats.incomplete_count}</td>
                  </tr>
                  <tr>
                    <td className={`${baseClasses}`}>Not Wanted</td>
                    <td className={baseClasses}>{stats.not_wanted_count}</td>
                  </tr>
                  <tr>
                    <td className={`${baseClasses} font-bold text-right pr-6`}>Total For Dinner:</td>
                    <td className={`${baseClasses} font-bold`}>{stats.selected_count+stats.not_selected_count+stats.incomplete_count}</td>
                  </tr>                  
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Course Frequencies Table */}
        <div className="flow-root summary-table">
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
        <div className="flow-root summary-table">
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
      </div>
    }
  </>)
}