'use client'
import React, { useState } from "react";
import useSWR from 'swr';
import Link from 'next/link'
import { fetcher } from "@lib/fetchers"; 
import { Bars3Icon, ArrowUturnLeftIcon, LockOpenIcon, LockClosedIcon} from '@heroicons/react/24/solid';
import { BiLogoSketch } from 'react-icons/bi';
import { RiVipFill } from "react-icons/ri";
import { MdRestaurantMenu } from "react-icons/md";

const mealTableApiUrl = "/api/admin/meal/seating"; // Update with the actual API URL
const submitApiUrl = "/api/admin/meal/seating"; // Update with the actual submission API URL
const maxTableCapacity = 12; // Set maximum allowed capacity to 12

export default function MealTableSorter() {
  const [fixedSeating, setFixedSeating] = useState<{ [key: string]: number }>({});
  const [movedRows, setMovedRows] = useState<{ [key: string]: number }>({});
  const [originalTableData, setOriginalTableData] = useState<any>(null);
  const [tableCapacities, setTableCapacities] = useState<{ [key: number]: number }>({});
  const [lockedTables, setLockedTables] = useState<{ [key: number]: boolean }>({});
  const [submitted, setSubmitted] = useState(false);

  const { data: tableData, error: tableError, isLoading: tableLoading, mutate, isValidating: tableValidating} = useSWR(mealTableApiUrl, fetcher, {
    keepPreviousData: false,
    onSuccess: (data) => {
      if (!originalTableData) {
        setOriginalTableData(JSON.parse(JSON.stringify(data.seating_data)));

        // Set the initial capacities based on the number of attendees on each table
        const initialCapacities = data.seating_data.map((table) => Math.max(10, Math.min(table.length, maxTableCapacity)));
        setTableCapacities(initialCapacities);

        // Automatically add attendees to fixedSeating if attendee.fixed is true
        const initialFixedSeating: { [key: string]: number } = {};
        data.seating_data.forEach((table, tableIndex) => {
          table.forEach((attendee) => {
            if (attendee.fixed) {
              initialFixedSeating[attendee.ticket_number] = tableIndex;
            }
          });
        });
        setFixedSeating(initialFixedSeating);
      }
    }
  });

  const handleDragStart = (e, tableIndex, attendee) => {
    if (fixedSeating[attendee.ticket_number] !== undefined) {
      e.preventDefault(); // Prevent dragging if the row is locked
      return;
    }
    e.dataTransfer.setData('attendee', JSON.stringify({ attendee, fromTableIndex: tableIndex }));
  };

  const handleDrop = (e, toTableIndex) => {
    e.preventDefault();
    const { attendee, fromTableIndex } = JSON.parse(e.dataTransfer.getData('attendee'));

    if (fromTableIndex !== toTableIndex) {
      const originalTableIndex = originalTableData.findIndex(table =>
        table.some(item => item.ticket_number === attendee.ticket_number)
      );

      // If the row is dropped back to its original table, reset it
      if (toTableIndex === originalTableIndex) {
        resetRow(attendee);
      } else {
        const updatedTableData = JSON.parse(JSON.stringify(tableData.seating_data));
        updatedTableData[fromTableIndex] = updatedTableData[fromTableIndex].filter((item) => item.ticket_number !== attendee.ticket_number);
        updatedTableData[toTableIndex].push(attendee);

        setMovedRows((prev) => ({
          ...prev,
          [attendee.ticket_number]: toTableIndex,
        }));

        tableData.seating_data = updatedTableData;
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const resetRow = (attendee) => {
    if (!originalTableData) {
      console.error("Original table data is not available.");
      return;
    }

    const originalTableIndex = originalTableData.findIndex(table =>
      table.some(item => item.ticket_number === attendee.ticket_number)
    );

    if (originalTableIndex !== -1) {
      const currentTableIndex = tableData.seating_data.findIndex(table =>
        table.some(item => item.ticket_number === attendee.ticket_number)
      );

      if (currentTableIndex !== -1 && currentTableIndex !== originalTableIndex) {
        const updatedTableData = JSON.parse(JSON.stringify(tableData.seating_data));

        updatedTableData[currentTableIndex] = updatedTableData[currentTableIndex].filter(
          (item) => item.ticket_number !== attendee.ticket_number
        );

        updatedTableData[originalTableIndex].push(attendee);

        setMovedRows((prev) => {
          const updated = { ...prev };
          delete updated[attendee.ticket_number];
          return updated;
        });

        tableData.seating_data = updatedTableData;
      }
    } else {
      console.error("Original table index not found for attendee.");
    }
  };

  const toggleFixedRow = (attendee, tableIndex) => {
    setFixedSeating((prev) => {
      const updated = { ...prev };
      if (updated[attendee.ticket_number] !== undefined) {
        delete updated[attendee.ticket_number];
      } else {
        updated[attendee.ticket_number] = tableIndex;
      }
      return updated;
    });
  };

  const handleCapacityChange = (tableIndex, newCapacity) => {
    if (newCapacity >= 1 && newCapacity <= maxTableCapacity) {
      setTableCapacities((prev) => ({
        ...prev,
        [tableIndex]: newCapacity,
      }));
    }
  };

  const handleToggleLockTable = (tableIndex) => {
    const isLocked = lockedTables[tableIndex];
    setLockedTables((prev) => ({
      ...prev,
      [tableIndex]: !isLocked,
    }));

    if (!isLocked) {
      const updatedFixedSeating = { ...fixedSeating };
      tableData.seating_data[tableIndex].forEach((attendee) => {
        updatedFixedSeating[attendee.ticket_number] = tableIndex;
      });
      setFixedSeating(updatedFixedSeating);
    } else {
      const updatedFixedSeating = { ...fixedSeating };
      tableData.seating_data[tableIndex].forEach((attendee) => {
        delete updatedFixedSeating[attendee.ticket_number];
      });
      setFixedSeating(updatedFixedSeating);
    }
  };

  const submitSeatingPlan = async () => {
    const payload = {
      tableCapacities,
      fixedSeating,
      movedRows,
    };

    try {
      await fetch(submitApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      setSubmitted(true);
      setTimeout(() => { mutate(); setSubmitted(false) },15000)
    } catch (error) {
      console.error('Error submitting seating plan:', error);
    }
  };

  return (
        <div className="bg-richblack-700 rounded-b-md p-4">
          {submitted ? (
            <>
              <p>Submitted. It will take at least 60 seconds before it is available to view again. It will auto reload </p>
              <button
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => {mutate(); setSubmitted(true); }}
              >
                Load Seating Plan
              </button>
            </>
          ) : tableLoading ? (
            <p>Loading...</p>
          ) : tableError ? (
            <p>Error loading table data.</p>
          ) : tableData && tableData.seating_data ? (
            <>
            {tableValidating ? 
                <div role="status" className='flex'>
                  <svg aria-hidden="true" className="w-4 h-4 me-2 text-gray-200 animate-spin dark:text-gray-600 fill-chillired-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
                  <span className="">Refreshing...</span>
                </div> : null
              }
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {tableData.seating_data.map((table, tableIndex) => {
                  const currentCapacity = tableCapacities[tableIndex] || maxTableCapacity;
                  const isTableLocked = lockedTables[tableIndex];

                  return (
                    <div
                      key={tableIndex}
                      className="bg-gray-800 p-4 rounded-md shadow-md"
                      onDrop={(e) => handleDrop(e, tableIndex)}
                      onDragOver={handleDragOver}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-semibold text-white">Table {tableIndex + 1}</h2>
                        <div className="flex items-center space-x-2">
                         
                          <label htmlFor={`capacity-${tableIndex}`} className="text-sm text-gray-400">Capacity:</label>
                          <input
                            id={`capacity-${tableIndex}`}
                            type="number"
                            min="1"
                            max={maxTableCapacity}
                            value={currentCapacity}
                            onChange={(e) => handleCapacityChange(tableIndex, parseInt(e.target.value))}
                            className="w-18 bg-gray-700 text-white border-none rounded-sm text-center"
                          />
                        </div>
                      </div>

                      <table className="min-w-full text-sm text-gray-300">
                        <thead>
                          <tr>
                            <th className="border-b border-gray-700 py-2 text-left">Name</th>
                            <th className="border-b border-gray-700 py-2 text-left">Group</th>
                              <th className="border-b border-gray-700 py-2 text-left">
                              <button onClick={() => handleToggleLockTable(tableIndex)} className="text-white">
                              {isTableLocked ? (
                                <LockClosedIcon className="h-5 w-5" />
                              ) : (
                                <LockOpenIcon className="h-5 w-5" />
                              )}
                            </button>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {table.map((attendee, attendeeIndex) => {
                            const isOverCapacity = attendeeIndex >= currentCapacity;
                            const isFixed = fixedSeating[attendee.ticket_number] !== undefined;
                            const isMoved = movedRows[attendee.ticket_number] !== undefined;

                            return (
                              <tr
                                key={attendee.ticket_number}
                                draggable={!isFixed} // Disable dragging if the row is locked
                                onDragStart={(e) => handleDragStart(e, tableIndex, attendee)}
                                className={`border-b border-gray-700 py-1 px-2 ${isOverCapacity ? 'bg-red-700' : isFixed ? 'bg-black/5 opacity-80 text-white/50' : isMoved ? 'bg-yellow-100/10' : 'bg-black/20'}`}
                              >
                                <td className={`py-1 px-2 flex items-center ${isFixed ? '' : 'font-bold'}`}>
                                  <Bars3Icon className={`w-4 h-4 ${isFixed ? "cursor-not-allowed" : "cursor-move"} text-gray-400 mr-2`} />
                                  {attendee.full_name}
                                  {attendee.is_gratis && !attendee.is_artist ? <BiLogoSketch title="Free Ticket" className='pl-1 w-6 h-6' /> : null }
                                  {attendee.is_artist ? <RiVipFill title="Artist Ticket" className='pl-1 w-6 h-6' /> : null }
                                  {attendee.dietary_requirements.selected && attendee.dietary_requirements.selected?.length > 0 ? 
                                    <div className="ml-1 flex items-center justify-center cursor-pointer relative group">
                                      <MdRestaurantMenu title="Dietary requirements" className='pl-1 w-6 h-6' />
                                      <div className="absolute hidden group-hover:block bg-white text-gray-900 text-xs rounded shadow-lg p-2 mt-2 w-48">
                                      {[...attendee.dietary_requirements.selected.join(", "), attendee.dietary_requirements.other].map((req, index) => (
                                        <div key={`dietary-${attendee.ticket_number}-${index}`}>
                                          {req}
                                        </div>                                        
                                      ))}
                                    </div>
                                  </div> : null }
                                </td>
                                <td className={`py-1 px-2 ${isFixed ? '' : 'font-bold'}`}>
                                  <Link href={`https://www.merseysidelatinfestival.co.uk/preferences?email=${attendee.email.replace("@","%40")}&ticket_number=${attendee.ticket_number}`}>{attendee.group || "No group"}</Link>
                                </td>
                                <td className="py-1 px-2">
                                  <button onClick={() => toggleFixedRow(attendee, tableIndex)} className="text-gray-400 hover:text-gray-600">
                                    {isFixed ? <LockClosedIcon className="w-4 h-4 text-blue-500" /> : <LockOpenIcon className="w-4 h-4" />}
                                  </button>
                                  {isMoved && (
                                    <button onClick={() => resetRow(attendee)} className="text-red-500 hover:text-red-700 ml-2">
                                      <ArrowUturnLeftIcon className="w-4 h-4" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
              <button
                className="mt-6 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={submitSeatingPlan}
              >
                Submit Seating Plan
              </button>
            </>
          ) : (
            <p>No table data available.</p>
          )}
        </div>
  );
}
