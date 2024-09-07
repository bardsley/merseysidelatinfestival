'use client'
import useSWR, {mutate} from 'swr';
import { fetcher } from  "@lib/fetchers";
import { Fragment } from 'react';
import {useState} from 'react';
import { TicketRow } from '@components/admin/lists/importRow';
import Papa from 'papaparse';

export default function ImportPageClient() {
  const [data, setData] = useState<any[][]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          setData(result.data);
        },
        header: true,
      });
    }
  };

  const transformAttendee = (row: any) => {
    // Convert the raw CSV data to match the attendee structure
    const transferred_in = row.history && row.history.length > 0;
    const transferred_out = row.transferred && row.transferred.ticket_number;
    const name_changed = row.history ? row.history.some(h => h.name_changed) : false;

    return {
      name: row.name || '',
      email: row.email || '',
      checkin_at: row.ticket_used || '',
      passes: row.type.includes(' (Student)') ? [row.type.replace(" (Student)", "")] : [row.type], // ? row.line_items.map((item: any) => item.description) : [],
      purchased_at: row.purchase_date ? new Date(parseInt(row.purchase_date) * 1000).toISOString() : '',
      ticket_number: row.ticket_number || null,
      active: true,
      status: 'paid_stripe',
      student_ticket: row.type.includes('Student') ? true : false,
      transferred_in: false,
      transferred_out: false,
      name_changed: false,
      transferred: null,
      history: [],
      unit_amount: row.amount
    };
  };

  const headerClassNames = "p-0 text-left text-sm font-semibold text-white "
  const headerContainerClassNames = "flex justify-between"
  const labelClassNames = "py-3.5 pl-4 block"

  return (
    <div>
      <input type="file" accept=".csv .txt" onChange={handleFileUpload} />
      {data.length > 0 ? (
      <div className="-mx-4 sm:mx-0 mt-3 ">
          <table className="min-w-full">
            <thead className="bg-richblack-700">
              <tr className=''>
                <th scope="col" className={`${headerClassNames} sm:rounded-l-lg`}>
                  <span className={headerContainerClassNames}>
                    <span className={`${labelClassNames} sm:pl-2 `}>Name 
                      <span className='sm:hidden'> & Details</span>
                      <span className='hidden sm:inline lg:hidden'>& Email</span>
                    </span>                    
                  </span>
                </th>
                <th scope="col" className={`${headerClassNames} hidden lg:table-cell`}>
                  <span className={headerContainerClassNames}>
                    <span className={`${labelClassNames}`}>Email</span>
                  </span>
                </th>
                <th scope="col" className={`${headerClassNames} hidden sm:table-cell`}>
                  <span className={headerContainerClassNames}>
                    <span className={`${labelClassNames}`}>Passes</span>
                  </span>
                </th>
                <th scope="col" className={`${headerClassNames} hidden sm:table-cell`}>
                  <span className={headerContainerClassNames}>
                    <span className={`${labelClassNames}`}>Amount</span>
                  </span>
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0 min-w-20 hidden sm:table-cell">
                  <span className="sr-only">Status</span>
                  {}
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0 min-w-20">
                  <span className="sr-only">Edit</span>
                  {}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-none">
              {data.map((row) => 
              <TicketRow 
                key={row.ticket_number} 
                attendee={transformAttendee(row)}
                setActiveTicket={true} 
                setNameChangeModalActive={false} 
                setTicketTransferModalActive={false} />
              )}
            </tbody>
          </table>
          
        </div>
      ): ''}
    </div>
  );

}