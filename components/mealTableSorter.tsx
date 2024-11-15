'use client'
import React, { useState } from "react";
import useSWR from 'swr';
import { fetcher } from "@lib/fetchers"; // Adjust the import path if necessary
import { Bars3Icon, ArrowUturnLeftIcon, LockOpenIcon, LockClosedIcon } from '@heroicons/react/24/solid'; // Importing icons

const mealTableApiUrl = "/api/admin/meal/seating"; // Update with the actual API URL
const submitApiUrl = "/api/admin/meal/seating"; // Update with the actual submission API URL
const maxTableCapacity = 12; // Set maximum allowed capacity to 12

export default function MealTableSorter() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [fixedSeating, setFixedSeating] = useState<{ [key: string]: number }>({});
  const [movedRows, setMovedRows] = useState<{ [key: string]: number }>({});
  const [originalTableData, setOriginalTableData] = useState<any>(null);
  const [tableCapacities, setTableCapacities] = useState<{ [key: number]: number }>({});
  const [lockedTables, setLockedTables] = useState<{ [key: number]: boolean }>({});
  const [submitted, setSubmitted] = useState(false);

  const { data: tableData, error: tableError, isLoading: tableLoading } = useSWR(mealTableApiUrl, fetcher, {
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
    } catch (error) {
      console.error('Error submitting seating plan:', error);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div
        className={`flex justify-between items-center bg-richblack-700 text-white px-4 py-3 ${isCollapsed ? "rounded-md" : "rounded-t-md"} cursor-pointer`}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h1 className="text-xl font-bold">Assign attendees to tables</h1>
        <span className={`transform transition-transform ${isCollapsed ? '' : 'rotate-90'}`}>›</span>
      </div>

      {!isCollapsed && (
        <div className="bg-richblack-700 rounded-b-md p-4">
          {submitted ? (
            <>
              <p>Submitted. It will take at least 60 seconds before it is available to view again.</p>
              <button
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => window.location.reload()}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
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
                          <button onClick={() => handleToggleLockTable(tableIndex)} className="text-white">
                            {isTableLocked ? (
                              <LockClosedIcon className="h-5 w-5" />
                            ) : (
                              <LockOpenIcon className="h-5 w-5" />
                            )}
                          </button>
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
                            <th className="border-b border-gray-700 py-2 text-left"></th>
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
                                className={`border-b border-gray-700 py-1 px-2 ${isOverCapacity ? 'bg-red-700' : isFixed ? 'bg-gray-100/10' : isMoved ? 'bg-yellow-100/10' : ''}`}
                              >
                                <td className={`py-1 px-2 flex items-center ${isFixed ? 'font-bold' : ''}`}>
                                  <Bars3Icon className="w-4 h-4 text-gray-400 mr-2" />
                                  {attendee.full_name}
                                </td>
                                <td className={`py-1 px-2 ${isFixed ? 'font-bold' : ''}`}>{attendee.group || "No group"}</td>
                                <td className="py-1 px-2">
                                  <button onClick={() => toggleFixedRow(attendee, tableIndex)} className="text-gray-400 hover:text-gray-600">
                                    {isFixed ? <LockClosedIcon className="w-4 h-4" /> : <LockOpenIcon className="w-4 h-4" />}
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
      )}
    </div>
  );
}
