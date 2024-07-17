'use client'
import React, { useState, useEffect } from 'react';
import Cell from './Cell';
import { ICellProps } from './Cell';
import { SelectedOptions } from './pricingTypes'
import { individualTickets,initialSelectedOptions, passes, passTypes, days, fullPassName } from './pricingDefaults'
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
    // console.log(type,selectedOptions)
    let initialOptions = selectedOptions
    Object.keys(initialSelectedOptions).forEach((elm) => { if(individualTickets[elm][type].isAvailable) { initialOptions[elm][type] = setTo }})
    setSelectedOptions({...initialOptions})
  }

  const calculateTotalCost = (evaluatedOptions) => {
    let total = 0;
    Object.keys(evaluatedOptions).forEach((day) => {
      Object.keys(evaluatedOptions[day]).forEach((passType) => {
        if (evaluatedOptions[day][passType]) {
          total += individualTickets && individualTickets[day] && individualTickets[day][passType]? individualTickets[day][passType][priceModel] : 0
          // console.log(day,passType,priceModel, individualTickets)
        }
      })
    })
    return total
  }

  const togglePriceModel = () => {
    setPriceModel(priceModel === "cost"? "studentCost" : "cost")
    setStudentDiscount(priceModel === "cost" ? true : false) //! Look backwards but priceModel hasn't changed yet
  }

  const passOrTicket = (itemName) => {
    return Object.keys(passes).includes(itemName)? "" : "Ticket"
  }

  // const deepCopy = (object: any) => {
  //   return JSON.parse(JSON.stringify(object))
  // }

  const optionsToPassArray = (options) => { // max 2 level
    const keys = Object.keys(options)
    return keys.flatMap((key) => {
      return Object.keys(options[key]).map((subkey) => {
        return options[key][subkey] === true || options[key][subkey].isAvailable ? `${key} ${subkey}` : null
      })
    }).filter(Boolean)
  }

  const availableOptionsForDay = (day:string) => {
    return Object.keys(individualTickets[day]).filter((key)=>{ return individualTickets[day][key].isAvailable})
  }
  const isAllDayOptions = (options: SelectedOptions,day:string) => {
    const daySelection = new Set(Object.keys(options[day]).filter((key) => options[day][key]))
    const allSelections = new Set(availableOptionsForDay(day))
    return daySelection.symmetricDifference(allSelections).size == 0
  }

  const availableDaysForOption = (option: string) => {
    return Object.keys(individualTickets).map((day) => {
      const options = availableOptionsForDay(day)
      return options.includes(option) ? day : null
    }).filter(Boolean)
  }

  const isAllPassOptions = (options: SelectedOptions,passType:string) => {
    const relevantDays = availableDaysForOption(passType)
    return relevantDays.map((day) => {
      return options[day][passType]
    }).every(Boolean)
  }

  const generateAllPassCombinations = (passes) => {
    
    const passTitles = Object.keys(passes).filter((item) => { return item != fullPassName})
    const passCombinations = generateAllSubArrays(passTitles)
    return [[],...passCombinations, [fullPassName]]
  }

  function generateAllSubArrays(arr) {
    const n = arr.length;
    let result = new Set()
    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) {
        let ans = [];
        for (let k = i; k <= j; k++) {
          ans.push(arr[k]);
        } 
        result.add(ans);
      }
    }
    return Array.from(result.values())
  }

  const priceForPassCombination = (passCombination,priceModel) => {
    const price = passCombination.reduce((price ,passTitle) => {
      // console.log(passTitle,passes[passTitle])
      return price + passes[passTitle][priceModel]
    },0)
    return price
  }

  const itemsFromPassCombination = (passCombination) => {
    const items = passCombination.reduce((items ,passTitle) => {
      passes[passTitle].combination.forEach((item) => items.add(item))
      return items
    },new Set)
    return Array.from(items.values())
  }

  const priceForIndividualItems = (items: any[]) => {
    const price = items.reduce((price ,itemKey) => {
      const [day,passType] = itemKey.split(' ')
      return price + individualTickets[day][passType][priceModel]
    },0)
    return price
  }
  
  const itemsNotCovered = (optionsRequested,optionsCovered) => {
    const requested = new Set(optionsRequested) 
    // console.log("Requested",requested,optionsRequested)
    const covered = new Set(optionsCovered)
    // console.log("Covered",requested,optionsCovered)
    // console.log("Difference",requested.difference(covered))
    return Array.from(requested.difference(covered).values())
  }

  const getBestCombination = (options) => {
    if(optionsToPassArray(options).length == 0) {
      return {price: 0, options: []}
    }
    const passCombinations = generateAllPassCombinations(passes)
    let bestOptions = []
    let bestPrice = 999.00
    passCombinations.forEach((passCombination: any[]) => {
      const packagePrice = priceForPassCombination(passCombination,priceModel)
      const tickePrice = priceForIndividualItems(itemsNotCovered(optionsToPassArray(selectedOptions),itemsFromPassCombination(passCombination)))
      const combinedPrice = packagePrice + tickePrice
      if(combinedPrice <= bestPrice) {
        bestPrice = combinedPrice
        bestOptions = [...passCombination, ...itemsNotCovered(optionsToPassArray(selectedOptions),itemsFromPassCombination(passCombination))]
      }
    })
    return {price: bestPrice, options: bestOptions}
  }

  const selectFullPass = () => {
    setSelectedOptions({
      Friday: { Party: true, Classes: false, Dinner: false },
      Saturday: { Party: true, Classes: true, Dinner: true },
      Sunday: { Party: true, Classes: true, Dinner: false },
    })
  }

  const selectPassCombination = () => {

    // const passCombinations = generateAllPassCombinations(passes)
    // console.log(passCombinations)
    // passCombinations.forEach((passCombination: any[]) => {
      // const packagePrice = priceForPassCombination(passCombination,priceModel)
      // const tickePrice = priceForIndividualItems(itemsNotCovered(optionsToPassArray(selectedOptions),itemsFromPassCombination(passCombination)))
      // const combinedPrice = packagePrice + tickePrice
      // const passCombination = Array.from(passCombinations.values())[0]
      // console.log(`${passCombination.join(' / ')} , £${packagePrice} + £${tickePrice} = £${combinedPrice}
      //   - provides    (${itemsFromPassCombination(passCombination).join(',')})
      //   - wanted      (${optionsToPassArray(selectedOptions)})
      //   - individuals (${itemsNotCovered(optionsToPassArray(selectedOptions),itemsFromPassCombination(passCombination))})
      //   `
      // )
    // })
    // console.log('-------')
    const {price: suggestedCost, options: suggestedPackages} = getBestCombination(selectedOptions)
    console.log(`Suggested packages: ${suggestedPackages.join(', ')} - £${suggestedCost}`)
    setPackageCost(suggestedCost)
    setPackages(suggestedPackages)

  }

  useEffect(() => {
    setTotalCost(calculateTotalCost(selectedOptions))
    selectPassCombination()
  }, [selectedOptions,priceModel,fullPassFunction])
  
  useEffect(() => {
    fullPassFunction(() => selectFullPass)
  },[])

  const cellClasses = 'border border-gray-600 text-center py-2 px-3 md:py-2 md:px-4 ';
  const headerClasses = cellClasses.replaceAll('border-gray-600','border-chillired-400')
  return (
    <div className="table-container w-full flex justify-center flex-col md:pt-12 max-w-6xl lg:mx-auto md:mx-3 col-span-5 text-xs md:text-base">
    
    
    
    <table className='option-table w-full mx-auto max-w-4xl table-auto border-collapse border-b border-ch}illired-300'>
      <thead>
        <tr className='bg-chillired-300 text-white border-chillired-400'>
          <th className={headerClasses}>
            
          </th>
          {days.map((day) => (
            <th key={day} className={headerClasses}>{day}</th> 
          ))}
        </tr>
        <tr>
          <th className={cellClasses}>Day pass</th>
          <th></th>
          {['Saturday','Sunday'].map((day) => { 
            const cellProps = {
              isSelected: isAllDayOptions(selectedOptions,day), 
              onSelect: setDayPass,
              studentDiscount: priceModel === "studentCost",
              day: day,
              option: { name:'', cost: passes[`${day} Pass`]['cost'], studentCost: passes[`${day} Pass`]['studentCost'], isAvailable: passes[`${day} Pass`]['isAvailable'] }
            } as ICellProps
            return (
            <th key={`${day}-full`} className={cellClasses}>
              <Cell {...cellProps} />
            </th>
          )})}
        </tr> 
      </thead>
      <tbody>
        {passTypes.map((passType) => {
          const passOption = passType === 'Party'? passes['Party Pass'] : passType === 'Classes' ? passes['Class Pass'] : {cost: 0, studentCost: 0, isAvailable: false}
          const cellProps = {
            isSelected: isAllPassOptions(selectedOptions,passType),
            onSelect: setTypePass,
            studentDiscount: priceModel === "studentCost",
            passType: passType,
            option: { name:'', cost: passOption['cost'], studentCost: passOption['studentCost'], isAvailable: passOption['isAvailable'] }

          } as ICellProps
          return (
          <tr key={passType}>
            <td className={cellClasses}>
              {passType}
              <Cell {...cellProps} /> 

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