import { individualTickets, days, passTypes } from './pricingDefaults'
import Cell from './Cell';
import { ICellProps } from './Cell';

export const OptionsTable = ({headerClasses, toggleCellClasses, cellClasses, selectedOptions, clearOptions, setIndividualOption, priceModel, locked, hidden = false}) => {
  console.log(selectedOptions)
  return (
    <table className={`option-table w-full mx-auto max-w-4xl table-auto border-collapse border-b border-chillired-300 ${hidden ? 'hidden' : ''}`}>
      <thead>
        <tr className='bg-merseyred-600 text-white border-merseyred-900'>
          <th className={headerClasses}>
            
          </th>
          {days.map((day) => (
            <th key={day} className={`${headerClasses} ${day == "NextYear" ? 'hidden': ''}`}>
              {day}
            </th> 
          ))}
        </tr>
      </thead>
      <tbody>
        {passTypes.map((passType) => {

          return (
          <tr key={passType}>
            <td className={toggleCellClasses}>
              {passType}
            </td>
            {days.map((day) => {
              const cellProps = {
                option: individualTickets[day][passType],
                isSelected: selectedOptions[day][passType],
                onSelect: setIndividualOption,
                studentDiscount: priceModel === "studentCost",
                day: day,
                passType: passType,
                locked: locked,
              } as ICellProps
              return (
              
                individualTickets[day][passType] && individualTickets[day][passType].isAvailable ? (
                  <td key={`${day}-${passType}`} className={`${cellClasses} ${day == "NextYear" ? 'hidden': ''}`}>
                  {selectedOptions[day][passType]}
                  <Cell {...cellProps} />  
                </td>
                ) : <td key={`${day}-${passType}`} className={cellClasses}></td>
            )})}
          </tr>
        )})}
      </tbody>
      <caption className='caption-top pt-6'>
        <div className='flex justify-between mb-2'>
          <h2 className="text-xl">Your Current Selection</h2>  
          <button onClick={clearOptions} id="clear-form" className='border border-gray-300 rounded-md px-3 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chillired-500 focus-visible:shadow-[0_0_8px_2px_theme(colors.chillired.500)]'>Clear my choices</button>
        </div>
      
      </caption>
    </table>    
  )
}
