'use client'
import React, { useState, useEffect } from 'react';
import Cell from './Cell';
import { ICellProps } from './Cell';
// import DiscountMessage from './DiscountMessage';

type Ticket = {
  cost: number;
  studentCost: number;
  isAvailable: boolean;
};

type DayTickets = {
  Party: Ticket;
  Classes: Ticket;
  Dinner: Ticket;
};

type IndividualTickets = {
  Friday: DayTickets;
  Saturday: DayTickets;
  Sunday: DayTickets;
};

type SelectedOptions = {
  Friday: { Party: boolean; Classes: boolean; Dinner: boolean };
  Saturday: { Party: boolean; Classes: boolean; Dinner: boolean };
  Sunday: { Party: boolean; Classes: boolean; Dinner: boolean };
};

type Pass = {
  cost: number;
  studentCost: number;
  isAvailable: boolean;
  saving: number;
  combination: string[];
};

type Passes = { [key: string]: Pass };

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

const allowedCombinationSums = [
  ['Sunday Pass', 'Saturday Pass'],
  ['Party Pass', 'Class Pass'],
  ['Class Pass', 'Dine and Dance Pass'],
];

const days = ['Friday', 'Saturday', 'Sunday']
const passTypes = ['Party', 'Classes', 'Dinner']



const cellClasses = 'border border-chillired-300 text-center py-6 px-16';
const Pricing = () => {
  const [selectedOptions, setSelectedOptions] = useState(initialSelectedOptions);
  const [provisionalOptions, setProvisionalOptions] = useState({});
  const [studentDiscount, setStudentDiscount] = useState(false);
  const [priceModel, setPriceModel] = useState("cost")
  const [totalCost, setTotalCost] = useState(0);

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
          total += individualTickets && individualTickets[day] && individualTickets[day][passType]? individualTickets[day][passType][priceModel] : 1
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

  const selectPassCombination = () => {
    let filteredOptions = JSON.parse(JSON.stringify(selectedOptions)) //? Deep copy
    // const orderedPassNames = Object.keys(passes).sort((a,b) => { return passes[a].saving - passes[b].saving })

    // // const passNames = [orderedPassNames[0]]
    // let potentialSaving = 0
    // // passNames.forEach((passName) => {
    // orderedPassNames.forEach((passName) => {
    //   const combinationsIncluded = passes[passName].combination
    //   combinationsIncluded.forEach((combination) => {
    //     const [day, passType] = combination.split(' ')
    //     if (filteredOptions[day][passType]) {
    //       filteredOptions[day][passType] = false
    //     }
    //   })
    //   const newcost = calculateTotalCost(filteredOptions) + passes[passName][priceModel]
    //   potentialSaving = newcost < totalCost ? totalCost - newcost : potentialSaving
    //   console.log(passName," saving ",potentialSaving,newcost,filteredOptions)
    //   console.log("Reset")
    //   filteredOptions = JSON.parse(JSON.stringify(selectedOptions)) //? Deep copy
    //   // setProvisionalOptions({...filteredOptions})
    //   // console.log(passName,filteredOptions)
    //   // remove everything in pass and add
    // })
    // console.log(orderedPassNames)

    const result = getMostCostEffectiveOptions(individualTickets, filteredOptions, passes);
    console.log(result);

  }

  // AI generated

  function getMostCostEffectiveOptions(
    individualTickets: IndividualTickets,
    selectedOptions: SelectedOptions,
    passes: Passes
  ): { totalCost: number; selectedPasses: string[]; individualTickets: string[] } {
    const passKeys = Object.keys(passes);
  
    // Helper function to calculate individual ticket costs
    function calculateIndividualCosts(
      selectedOptions: SelectedOptions
    ): { cost: number; studentCost: number; tickets: string[] } {
      let cost = 0;
      let studentCost = 0;
      let tickets: string[] = [];
  
      for (const day in selectedOptions) {
        for (const event in selectedOptions[day]) {
          if (selectedOptions[day][event]) {
            const ticket: Ticket = individualTickets[day as keyof IndividualTickets][event as keyof DayTickets];
            if (ticket.isAvailable) {
              cost += ticket.cost;
              studentCost += ticket.studentCost;
              tickets.push(`${day} ${event}`);
            }
          }
        }
      }
  
      return { cost, studentCost, tickets };
    }
  
    // Recursive function to find the best combination of passes and individual tickets
    function findBestCombination(
      selectedPasses: string[],
      individualSelected: string[],
      startIndex: number
    ): { cost: number; studentCost: number; passes: string[]; individualTickets: string[] } {
      if (startIndex >= passKeys.length) {
        const cost = calculateCostForPassCombination(selectedPasses) + calculateIndividualCostsFromSelected(individualSelected).cost;
        const studentCost = calculateStudentCostForPassCombination(selectedPasses) + calculateIndividualCostsFromSelected(individualSelected).studentCost;
        if (areAllSelectedEventsCovered(selectedOptions, selectedPasses, individualSelected)) {
          return { cost, studentCost, passes: [...selectedPasses], individualTickets: [...individualSelected] };
        } else {
          return { cost: Infinity, studentCost: Infinity, passes: [], individualTickets: [] };
        }
      }
  
      // Calculate cost for the current combination
      const withCurrentPass = findBestCombination([...selectedPasses, passKeys[startIndex]], individualSelected, startIndex + 1);
      const withoutCurrentPass = findBestCombination(selectedPasses, individualSelected, startIndex + 1);
      const addIndividual = findBestCombination(selectedPasses, [...individualSelected, passKeys[startIndex]], startIndex + 1);
  
      // Compare and return the best combination
      return [withCurrentPass, withoutCurrentPass, addIndividual].reduce((prev, curr) => (prev.cost < curr.cost ? prev : curr));
    }
  
    // Helper function to check if all required events are covered
    function areAllSelectedEventsCovered(
      selectedOptions: SelectedOptions,
      selectedPasses: string[],
      individualSelected: string[]
    ): boolean {
      const requiredEvents = new Set<string>();
      for (const day in selectedOptions) {
        for (const event in selectedOptions[day]) {
          if (selectedOptions[day][event]) {
            requiredEvents.add(`${day} ${event}`);
          }
        }
      }
  
      const coveredEvents = new Set<string>();
      for (const pass of selectedPasses) {
        for (const event of passes[pass].combination) {
          coveredEvents.add(event);
        }
      }
  
      for (const event of individualSelected) {
        coveredEvents.add(event);
      }
  
      for (const event of requiredEvents) {
        if (!coveredEvents.has(event)) {
          return false;
        }
      }
      return true;
    }
  
    // Helper function to calculate cost for a pass combination
    function calculateCostForPassCombination(selectedPasses: string[]): number {
      return selectedPasses.reduce((total, pass) => total += passes[pass].cost, 0);
    }
  
    // Helper function to calculate student cost for a pass combination
    function calculateStudentCostForPassCombination(selectedPasses: string[]): number {
      return selectedPasses.reduce((total, pass) => total += passes[pass].studentCost, 0);
    }
  
    // Helper function to calculate individual costs from selected individual tickets
    function calculateIndividualCostsFromSelected(individualSelected: string[]): { cost: number; studentCost: number } {
      let cost = 0;
      let studentCost = 0;
      for (const event of individualSelected) {
        const [day, eventName] = event.split(' ');
        const ticket = individualTickets[day as keyof IndividualTickets][eventName as keyof DayTickets];
        if (ticket.isAvailable) {
          cost += ticket.cost;
          studentCost += ticket.studentCost;
        }
      }
      return { cost, studentCost };
    }
  
    const bestCombination = findBestCombination([], [], 0);
  
    // Compare individual ticket cost with the best pass combination cost
    const individualCosts = calculateIndividualCosts(selectedOptions);
  
    if (individualCosts.cost < bestCombination.cost) {
      return { totalCost: individualCosts.cost, selectedPasses: [], individualTickets: individualCosts.tickets };
    } else {
      return { totalCost: bestCombination.cost, selectedPasses: bestCombination.passes, individualTickets: bestCombination.individualTickets };
    }
  }
  // End AI generated

  useEffect(() => {
    setTotalCost(calculateTotalCost(selectedOptions))
  }, [selectedOptions,priceModel])

  return (
    <div className="table-container w-full max-w-6xl mx-auto">
      <button className="border rounded-md p-6" onClick={selectPassCombination}>Select pass</button>
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
              isSelected: selectedOptions[day]['Party'] && (selectedOptions[day]['Dinner'] || day === 'Sunday') && selectedOptions[day]['Classes'],
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
            isSelected: (selectedOptions['Friday'][passType] || passType === 'Classes') && (selectedOptions['Saturday'][passType]) && (selectedOptions['Sunday'][passType] || passType === 'Classes'),
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
    <h2 className='text-2xl'>£{totalCost}</h2>
    <div className='flex'>
    <pre>Selected 
--

      {JSON.stringify(selectedOptions,null,2)}</pre>
    <pre>Provisonal
      --

      {JSON.stringify(provisionalOptions,null,2)}</pre>
    </div>
    
    </div>
  )
};

export default Pricing; 