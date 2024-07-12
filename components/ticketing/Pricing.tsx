'use client'
import React, { useState, useEffect } from 'react';
import Cell from './Cell';
import { ICellProps } from './Cell';
import symmetricDifference from 'set.prototype.symmetricdifference'
symmetricDifference.shim();
// import DiscountMessage from './DiscountMessage';

// type Ticket = {
//   cost: number;
//   studentCost: number;
//   isAvailable: boolean;
// };
// type DayTickets = {
//   Party: Ticket;
//   Classes: Ticket;
//   Dinner: Ticket;
// };
// type IndividualTickets = {
//   Friday: DayTickets;
//   Saturday: DayTickets;
//   Sunday: DayTickets;
// };
type SelectedOptions = {
  Friday: { Party: boolean; Classes: boolean; Dinner: boolean };
  Saturday: { Party: boolean; Classes: boolean; Dinner: boolean };
  Sunday: { Party: boolean; Classes: boolean; Dinner: boolean };
};
// type Pass = {
//   cost: number;
//   studentCost: number;
//   isAvailable: boolean;
//   saving: number;
//   combination: string[];
// };
// type Passes = { [key: string]: Pass };

const individualTickets = { 
  Friday: {
    Party: { cost: 15, studentCost: 10, isAvailable: true },
    Classes: { cost: 0, studentCost: 0, isAvailable: false },
    Dinner: { cost: 0, studentCost: 0, isAvailable: false }
  },
  Saturday: {
    Party: { cost: 22, studentCost: 15, isAvailable: true },
    Classes: { cost: 55, studentCost: 45, isAvailable: true },
    Dinner: { cost: 40, studentCost: 40, isAvailable: true }
  },
  Sunday: {
    Party: { cost: 15, studentCost: 10, isAvailable: true },
    Classes: { cost: 55, studentCost: 45, isAvailable: true },
    Dinner: { cost: 0, studentCost: 0, isAvailable: false }
  }
}

const initialSelectedOptions = {
  Friday: {
    Party: false,
    Classes: false,
    Dinner: false
  },
  Saturday: {
    Party: false,
    Classes: false,
    Dinner: false
  },
  Sunday: {
    Party: false,
    Classes: false,
    Dinner: false
  }
}

const passes = {
  'Saturday Pass': { cost: 95, studentCost: 85, isAvailable: true, saving: 22, combination: ['Saturday Classes', 'Saturday Party', 'Saturday Dinner'] },
  'Sunday Pass': { cost: 59, studentCost: 50, isAvailable: true, saving: 11, combination: ['Sunday Pass', 'Sunday Party'] },
  'Class Pass': { cost: 95, studentCost: 85, isAvailable: true, saving: 15, combination: ['Saturday Classes', 'Sunday Classes'] },
  'Dine and Dance Pass': { cost: 60, studentCost: 55, isAvailable: true, saving: 2, combination: ['Saturday Dinner', 'Saturday Party'] },
  'Party Pass': { cost: 45, studentCost: 35, isAvailable: true, saving: 7, combination: ['Friday Party', 'Saturday Party', 'Sunday Party'] },
  'Full Pass': { cost: 125, studentCost: 110, isAvailable: true, saving: 77, combination: ['Friday Party', 'Saturday Classes', 'Saturday Dinner', 'Saturday Party', 'Sunday Classes', 'Sunday Party'] },
}

// const allowedCombinationSums = [
//   ['Sunday Pass', 'Saturday Pass'],
//   ['Party Pass', 'Class Pass'],
//   ['Class Pass', 'Dine and Dance Pass'],
// ];

const days = ['Friday', 'Saturday', 'Sunday']
const passTypes = ['Party', 'Classes', 'Dinner']


const cellClasses = 'border border-chillired-300 text-center py-6 px-16';
const Pricing = () => {
  const [selectedOptions, setSelectedOptions] = useState(initialSelectedOptions);
  // const [provisionalOptions, setProvisionalOptions] = useState({});
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
    const fullPassName = 'Full Pass'
    const passTitles = Object.keys(passes).filter((item) => { return item != fullPassName})
    const passCombinations = generateAllSubArrays(passTitles)
    return [[],...passCombinations, [fullPassName]]
  }

  function generateAllSubArrays(arr) {
    const n = arr.length;
    let result = new Set()
    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) {
        // we have index i and j of the subarray, let's print it
        let ans = [];
        for (let k = i; k <= j; k++) {
          ans.push(arr[k]);
        } 
        result.add(ans);
      }
    }
    return Array.from(result.values())
  }

  const priceForPasscomination = (passCombination,priceModel) => {
    const price = passCombination.reduce((price ,passTitle) => {
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
      const packagePrice = priceForPasscomination(passCombination,priceModel)
      const tickePrice = priceForIndividualItems(itemsNotCovered(optionsToPassArray(selectedOptions),itemsFromPassCombination(passCombination)))
      const combinedPrice = packagePrice + tickePrice
      if(combinedPrice <= bestPrice) {
        bestPrice = combinedPrice
        bestOptions = [...passCombination, ...itemsNotCovered(optionsToPassArray(selectedOptions),itemsFromPassCombination(passCombination))]
      }
    })
    return {price: bestPrice, options: bestOptions}
  }


  const selectPassCombination = () => {
    // let filteredOptions = deepCopy(selectedOptions)
    // const orderedPassNames = optionsToPassArray(selectedOptions)//Object.keys(passes).sort((a,b) => { return passes[a].saving - passes[b].saving })
    // console.log(orderedPassNames)
    const passCombinations = generateAllPassCombinations(passes)
    console.log(passCombinations)
    passCombinations.forEach((passCombination: any[]) => {
      const packagePrice = priceForPasscomination(passCombination,priceModel)
      const tickePrice = priceForIndividualItems(itemsNotCovered(optionsToPassArray(selectedOptions),itemsFromPassCombination(passCombination)))
      const combinedPrice = packagePrice + tickePrice
      // const passCombination = Array.from(passCombinations.values())[0]
      console.log(`${passCombination.join(' / ')} , £${packagePrice} + £${tickePrice} = £${combinedPrice}
        - provides    (${itemsFromPassCombination(passCombination).join(',')})
        - wanted      (${optionsToPassArray(selectedOptions)})
        - individuals (${itemsNotCovered(optionsToPassArray(selectedOptions),itemsFromPassCombination(passCombination))})
        `
      )
    })

    console.log('-------')
    const {price: suggestedCost, options: suggestedPackages} = getBestCombination(selectedOptions)
    setPackageCost(suggestedCost)
    setPackages(suggestedPackages)

  }

  useEffect(() => {
    setTotalCost(calculateTotalCost(selectedOptions))
    selectPassCombination()
  }, [selectedOptions,priceModel])

  return (
    <div className="table-container w-full flex justify-center flex-col pt-12 max-w-6xl mx-auto">
      {/* <button className="border rounded-md p-6" onClick={selectPassCombination}>Select pass</button> */}
    <table className='option-table table-auto border-collapse border-b border-chillired-300'>
      <thead>
        <tr >
          <th className={cellClasses}>Full Pass Toggle</th>
          {days.map((day) => (
            <th key={day} className={cellClasses}>{day}</th> 
          ))}
        </tr>
        <tr>
          <th className={cellClasses}>Full pass</th>
          <th></th>
          {['Saturday','Sunday'].map((day) => { 
            const cellProps = {
              isSelected: isAllDayOptions(selectedOptions,day), //selectedOptions[day]['Party'] && (selectedOptions[day]['Dinner'] || day === 'Sunday') && selectedOptions[day]['Classes'],
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
                  {/* {day} {passType} £{individualTickets[day][passType][priceModel]} <br/>  */}
                  {selectedOptions[day][passType]}
                  <Cell {...cellProps} />  
                  {/* {JSON.stringify(individualTickets[day][passType],null,2)} */}
                </td>
                ) : <td key={`${day}-${passType}`} className={cellClasses}></td>
            )})}
          </tr>
        )})}
      </tbody>
      <caption className='caption-bottom pt-6'>
        
        <Cell option={{name: 'I am a student with ID', cost: 0, studentCost: 0, isAvailable: true } }
        isSelected={studentDiscount} onSelect={togglePriceModel} studentDiscount={studentDiscount} />
      </caption>
    </table>
    
    { totalCost && totalCost > 0 ? (
      <div className='mx-auto max-w-md pt-12'>
        {/* <h2 className='text-2xl'>Full Price £{totalCost}</h2>
        <h2 className='text-2xl'>Packages & Tickets {packages.join(', ')}</h2>
        <h2 className='text-2xl'>Pass Saving £{totalCost - packageCost}</h2>
        <h2 className='text-2xl'>Your Package £{packageCost}</h2> */}

        <p>We Suggest</p>
        <h2 className='text-2xl'>{packages.join(', ')}</h2>
        <h2 className='text-2xl'>{ totalCost - packageCost > 0 ? (<span className='line-through'>£{totalCost}</span>) : null } £{packageCost}</h2>
        { totalCost - packageCost > 0 ? (<p>Saving you £{totalCost - packageCost}!</p>) : null }

      </div>
    ) : null }
    
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

export default Pricing; 