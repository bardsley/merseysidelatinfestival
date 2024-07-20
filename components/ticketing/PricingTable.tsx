'use client'
import React, { useState, useEffect } from 'react';
import Cell from './Cell';
import { ICellProps } from './Cell';
import { individualTickets,initialSelectedOptions, passTypes, days, fullPassName } from './pricingDefaults'
import { calculateTotalCost, passOrTicket, getBestCombination } from './pricingUtilities'
import PassCards from './passes'
import symmetricDifference from 'set.prototype.symmetricdifference'
import difference from 'set.prototype.difference'
symmetricDifference.shim();
difference.shim();


const PricingTable = ({fullPassFunction}:{fullPassFunction:Function}) => {
  const [selectedOptions, setSelectedOptions] = useState(initialSelectedOptions);
  const [studentDiscount, setStudentDiscount] = useState(false);
  const [priceModel, setPriceModel] = useState("cost")
  const [totalCost, setTotalCost] = useState(0);
  const [packages,setPackages] = useState([])
  const [packageCost, setPackageCost] = useState(0)

  const togglePriceModel = () => {
    setPriceModel(priceModel === "cost"? "studentCost" : "cost")
    setStudentDiscount(priceModel === "cost" ? true : false) //! This looks backwards but priceModel hasn't changed yet
  }

  const selectFullPass = () => {
    setSelectedOptions({
      Friday: { Party: true, Classes: false, Dinner: false },
      Saturday: { Party: true, Classes: true, Dinner: true },
      Sunday: { Party: true, Classes: true, Dinner: false },
    })
  }
  const selectPassCombination = () => {
    const {price: suggestedCost, options: suggestedPackages} = getBestCombination(selectedOptions,priceModel)
    console.log(`Suggested packages: ${suggestedPackages.join(', ')} - £${suggestedCost}`)
    setPackageCost(suggestedCost)
    setPackages(suggestedPackages)
  }

  const setIndividualOption = (day,passType) => {
    let initialOptions = selectedOptions
    initialOptions[day][passType] =!initialOptions[day][passType]
    setSelectedOptions({...initialOptions})
  }
  const setDayPass = (day,setTo) => {
    // console.log(day,selectedOptions)
    let initialOptions = selectedOptions
    Object.keys(initialSelectedOptions[day]).forEach((elm) => { if(individualTickets[day][elm].isAvailable) { initialOptions[day][elm] = setTo } })
    setSelectedOptions({...initialOptions})
  }
  const setTypePass = (type,setTo) => {
    console.log(type,setTo)
    // console.log(type,selectedOptions,individualTickets,individualTickets)
    let initialOptions = selectedOptions
    Object.keys(initialSelectedOptions).forEach((elm) => { if(individualTickets[elm][type].isAvailable) { initialOptions[elm][type] = setTo }})
    setSelectedOptions({...initialOptions})
  }

  const setDinnerPass = (setTo) => {
    let initialOptions = selectedOptions
    initialOptions.Saturday.Dinner = setTo
    initialOptions.Saturday.Party = setTo
    setSelectedOptions({...initialOptions})
  }

  useEffect(() => {
    setTotalCost(calculateTotalCost(selectedOptions,priceModel))
    selectPassCombination()
  }, [selectedOptions,priceModel,fullPassFunction])
  
  useEffect(() => {
    fullPassFunction(() => selectFullPass)
  },[])

  const cellClasses = 'border border-gray-600 text-center py-2 px-3 md:py-2 md:px-4 ';
  const headerClasses = cellClasses.replaceAll('border-gray-600','border-chillired-400')
  const toggleCellClasses = "bg-richblack-600 text-white " +  cellClasses
  return (
    <div className="table-container w-full flex justify-center flex-col md:pt-12 max-w-full lg:mx-auto md:mx-3 col-span-5 text-xs md:text-base">
    
    <PassCards setDayPass={setDayPass} setTypePass={setTypePass} setDinnerPass={setDinnerPass}></PassCards>
    
    <table className='option-table w-full mx-auto max-w-4xl table-auto border-collapse border-b border-ch}illired-300'>
      <thead>
        <tr className='bg-chillired-300 text-white border-chillired-400'>
          <th className={headerClasses}>
            
          </th>
          {days.map((day) => (
            <th key={day} className={headerClasses}>{day}</th> 
          ))}
        </tr>
        {/* <tr>
          <th className={toggleCellClasses}>Day pass</th>
          <th className={toggleCellClasses}></th>
          {['Saturday','Sunday'].map((day) => { 
            const cellProps = {
              isSelected: isAllDayOptions(selectedOptions,day), 
              onSelect: setDayPass,
              studentDiscount: priceModel === "studentCost",
              day: day,
              option: { name:'', cost: passes[`${day} Pass`]['cost'], studentCost: passes[`${day} Pass`]['studentCost'], isAvailable: passes[`${day} Pass`]['isAvailable'] }
            } as ICellProps
            return (
            <th key={`${day}-full`} className={toggleCellClasses}>
              <Cell {...cellProps} />
            </th>
          )})}
        </tr>  */}
      </thead>
      <tbody>
        {passTypes.map((passType) => {
          // const passOption = passType === 'Party'? passes['Party Pass'] : passType === 'Classes' ? passes['Class Pass'] : {cost: 0, studentCost: 0, isAvailable: false}
          // const cellProps = {
          //   isSelected: isAllPassOptions(selectedOptions,passType),
          //   onSelect: setTypePass,
          //   studentDiscount: priceModel === "studentCost",
          //   passType: passType,
          //   option: { name:'', cost: passOption['cost'], studentCost: passOption['studentCost'], isAvailable: passOption['isAvailable'] }

          // } as ICellProps
          return (
          <tr key={passType}>
            <td className={toggleCellClasses}>
              {passType}
              {/* <Cell {...cellProps} />  */}

            </td>
            {days.map((day) => {
              const cellProps = {
                option: individualTickets[day][passType],
                isSelected: selectedOptions[day][passType],
                onSelect: setIndividualOption,
                studentDiscount: priceModel === "studentCost",
                day: day,
                passType: passType,
              } as ICellProps
              return (
              
                individualTickets[day][passType].isAvailable ? (
                  <td key={`${day}-${passType}`} className={cellClasses}>
                  {selectedOptions[day][passType]}
                  <Cell {...cellProps} />  
                </td>
                ) : <td key={`${day}-${passType}`} className={cellClasses}></td>
            )})}
          </tr>
        )})}
      </tbody>
      <caption className='caption-bottom pt-6'>
        
        <Cell option={{name: 'I am a student and will bring Student ID', cost: 0, studentCost: 0, isAvailable: true } }
        isSelected={studentDiscount} onSelect={togglePriceModel} studentDiscount={studentDiscount} />
      </caption>
    </table>
    <div className='flex mx-auto w-full flex-col md:flex-row justify-between max-w-2xl mt-12 mb-12 p-12 gap-12 items-start rounded border border-gray-600'>
        
    { totalCost && totalCost > 0 ? (
      <>
        <div className='max-w-2/3'>
          <p>{packages.length == 1 && packages[0] == fullPassName ?  "Best deal" : "We Suggest"}</p>
          <h2 className='text-2xl'>{packages.map((packageName) => `${packageName} ${passOrTicket(packageName)}`).join(', ')}</h2>
          <h2 className='text-3xl font-bold'>{ totalCost - packageCost > 0 ? (<span className='line-through'>£{totalCost}</span>) : null } £{packageCost}</h2>
          { totalCost - packageCost > 0 ? (<p>Saving you £{totalCost - packageCost}!</p>) : null }
        </div>
        <div className='flex w-full md:w-auto flex-col md:flex-row items-center justify-center'>
          <button className='bg-chillired-400 text-white rounded-lg py-6 px-12 hover:bg-chillired-700 text-nowrap w-full max-w-72 md:w-auto'>Buy Now</button>
        </div>
        
      </>
    ) : "Select options in the table above to see the suggested packages" }
    </div>
    {/* <hr />
    <h2>Debug Ignore below the line</h2>
    <div className='flex'>
      
    <pre>Selected 
--

      {JSON.stringify(selectedOptions,null,2)}</pre>
    <pre>Provisonal
      --

      {JSON.stringify(provisionalOptions,null,2)}</pre>
    </div> */}
    
    </div>
  )
};

export default PricingTable; 

{/*  */}