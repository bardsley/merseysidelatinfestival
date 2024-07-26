'use client'
import React, { useState, useEffect } from 'react';
import { useFormStatus } from "react-dom"
import Cell from './Cell';
import { ICellProps } from './Cell';
import { individualTickets,initialSelectedOptions, passTypes, days, fullPassName } from './pricingDefaults'
import { calculateTotalCost, passOrTicket, getBestCombination } from './pricingUtilities'
import PassCards from './passes'
import { useRouter } from 'next/navigation'
import { deepCopy } from '../../lib/useful'
import symmetricDifference from 'set.prototype.symmetricdifference'
import difference from 'set.prototype.difference'
symmetricDifference.shim();
difference.shim();


const PricingTable = ({fullPassFunction,scrollToElement}:{fullPassFunction:Function,scrollToElement:Function}) => {
  const [selectedOptions, setSelectedOptions] = useState(deepCopy(initialSelectedOptions));
  const [studentDiscount, setStudentDiscount] = useState(false);
  const [priceModel, setPriceModel] = useState("cost")
  const [totalCost, setTotalCost] = useState(0);
  const [packages,setPackages] = useState([])
  const [packageCost, setPackageCost] = useState(0)
  const router = useRouter()

  const togglePriceModel = () => {
    setPriceModel(priceModel === "cost"? "studentCost" : "cost")
    setStudentDiscount(priceModel === "cost" ? true : false) //! This looks backwards but priceModel hasn't changed yet
  }

  const selectFullPass = (setTo) => {
    let initialOptions = selectedOptions
    days.forEach((day) => {
      passTypes.forEach((passType) => {
        initialOptions[day][passType] = individualTickets[day][passType].isAvailable ? setTo : false
      })
    })
    setSelectedOptions({...initialOptions})
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
    // console.log(type,setTo)
    // console.log(type,selectedOptions,individualTickets,individualTickets)
    let initialOptions = selectedOptions
    Object.keys(initialSelectedOptions).forEach((elm) => { if(individualTickets[elm][type].isAvailable) { initialOptions[elm][type] = setTo }})
    setSelectedOptions({...initialOptions})
  }

  const setDinnerPass = (setTo) => {
    let initialOptions = selectedOptions
    initialOptions.Saturday.Dinner = individualTickets.Saturday.Dinner.isAvailable ? setTo : false
    initialOptions.Saturday.Party = individualTickets.Saturday.Party.isAvailable ? setTo : false
    setSelectedOptions({...initialOptions})
  }

  const clearOptions = () => {
    console.log("Options reset to: ", initialSelectedOptions)
    localStorage.removeItem("selectedOptions")
    setSelectedOptions(deepCopy(initialSelectedOptions))
  }

  useEffect(() => {
    setTotalCost(calculateTotalCost(selectedOptions,priceModel))
    selectPassCombination()
  }, [selectedOptions,priceModel,fullPassFunction])
  
  useEffect(() => {
    fullPassFunction(() => selectFullPass)
  },[])

  useEffect(() => {
    const storedOptions = localStorage.getItem("selectedOptions")
    if(storedOptions) { setSelectedOptions(JSON.parse(storedOptions)) }
  },[])

  function CheckoutButton() {
    const { pending } = useFormStatus();
    return (
      <button type="submit" disabled={pending} 
        className='bg-chillired-400 text-white rounded-lg py-6 px-12 hover:bg-chillired-700 text-nowrap w-full max-w-72 md:w-auto'>
        {pending ? "Checking Out..." : "Buy Now"}
      </button>

    );
  }

  async function checkout() {
    localStorage.setItem("selectedOptions", JSON.stringify(selectedOptions))
    router.push("/checkout") //TODO This 100% needs a check for errors
  }
  
  const cellClasses = 'border border-gray-600 text-center py-2 px-3 md:py-2 md:px-4 ';
  const headerClasses = cellClasses.replaceAll('border-gray-600','border-chillired-400')
  const toggleCellClasses = "bg-richblack-600 text-white " +  cellClasses
  return (
    <div className="table-container w-full flex justify-center flex-col md:pt-12 max-w-full lg:mx-auto md:mx-3 col-span-5 text-xs md:text-base">
    
      <PassCards 
        selected={packages} 
        setDayPass={setDayPass} 
        setTypePass={setTypePass} 
        setDinnerPass={setDinnerPass} 
        priceModel={priceModel} 
        scrollToElement={scrollToElement} 
        shouldScroll={packages.length == 0}
        selectFullPass={selectFullPass}></PassCards>
      
      <div className='mb-12'>
        <Cell option={{name: 'I am a student and will bring Student ID', cost: 0, studentCost: 0, isAvailable: true } }
          isSelected={studentDiscount} onSelect={togglePriceModel} studentDiscount={studentDiscount} />
      </div>
      
      <table className='option-table w-full mx-auto max-w-4xl table-auto border-collapse border-b border-ch}illired-300'>
        <thead>
          <tr className='bg-chillired-300 text-white border-chillired-400'>
            <th className={headerClasses}>
              
            </th>
            {days.map((day) => (
              <th key={day} className={headerClasses}>{day}</th> 
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
        <caption className='caption-top pt-6'>
          <div className='flex justify-between mb-2'>
            <h2 className="text-xl">Your Current Selection</h2>  
            <button onClick={clearOptions} id="clear-form" className='border border-gray-300 rounded-md px-3 py-1'>Clear my choices</button>
          </div>
        
        </caption>
      </table>
      <div className='flex mx-auto w-full flex-col md:flex-row justify-between max-w-2xl mt-12 mb-12 p-12 gap-12 items-start rounded border border-gray-600'>
          
      { totalCost && totalCost > 0 ? (
        <>
          <div className='max-w-2/3'>
            <p>{packages.length == 1 && packages[0] == fullPassName ?  "Best deal" : "Best option for you"}</p>
            <h2 className='text-2xl'>{packages.map((packageName) => `${packageName} ${passOrTicket(packageName)}`).join(', ').replace('Saturday Dinner Ticket','Dinner Ticket')}</h2>
            <h2 className='text-3xl font-bold'>{ totalCost - packageCost > 0 ? (<span className='line-through'>£{totalCost}</span>) : null } £{packageCost}</h2>
            { totalCost - packageCost > 0 ? (<p>Saving you £{totalCost - packageCost} on the full cost of those options!</p>) : null }
          </div>
          <form action={checkout} className='flex w-full md:w-auto flex-col md:flex-row items-center justify-center'>
          <CheckoutButton></CheckoutButton>
          </form>
          
        </>
      ) : "Select options in the table above to see the suggested packages" }
      </div>
      
      { process.env.NODE_ENV == 'development' ? <>
      <hr />
      <h2>Debug Ignore below the line</h2>
      <div className='flex'>
        <pre>Selected -- {JSON.stringify(selectedOptions,null,2)}</pre>
        <pre>Packages--{JSON.stringify(packages,null,2)}</pre>
      </div>
      </> : null }
      
    </div>
  )
};

export default PricingTable; 

{/*  */}