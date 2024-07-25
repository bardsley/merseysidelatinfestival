import { SelectedOptions } from './pricingTypes'
import { individualTickets, passes, fullPassName} from './pricingDefaults'
import power from 'power-set'

const generateAllPassCombinations = (passes) => {
    
  const passTitles = Object.keys(passes).filter((item) => { return item != fullPassName && passes[item].isAvailable })
  const passCombinations = power(passTitles)
  // console.log(passCombinations)
  // passCombinations.forEach((passCombination: any[]) => {
  //   const packagePrice = priceForPassCombination(passCombination,priceModel)
  //   const tickePrice = priceForIndividualItems(itemsNotCovered(optionsToPassArray(selectedOptions),itemsFromPassCombination(passCombination)))
  //   const combinedPrice = packagePrice + tickePrice
  //   // const passCombination = Array.from(passCombinations.values())[0]
  //   console.log(`${passCombination.join(' / ')} , £${packagePrice} + £${tickePrice} = £${combinedPrice}
  //     - provides    (${itemsFromPassCombination(passCombination).join(',')})
  //     - wanted      (${optionsToPassArray(selectedOptions)})
  //     - individuals (${itemsNotCovered(optionsToPassArray(selectedOptions),itemsFromPassCombination(passCombination))})
  //     `
  //   )
  // })
  console.log('---PassCombination Generated---')
  return [[],...passCombinations, [fullPassName]]
}
const calculateTotalCost = (evaluatedOptions,priceModel) => {
  let total = 0;
  if(['cost','studentCost'].includes(priceModel)) {
    Object.keys(evaluatedOptions).forEach((day) => {
      Object.keys(evaluatedOptions[day]).forEach((passType) => {
        if (evaluatedOptions[day][passType]) {
          // total += individualTickets && individualTickets[day] && individualTickets[day][passType]? individualTickets[day][passType][priceModel] : 0
          total += individualTickets && individualTickets[day] && individualTickets[day][passType]? individualTickets[day][passType].cost : 0
          // console.log(day,passType,priceModel, individualTickets)
        }
      })
    })  
  }
  return total
}
const passOrTicket = (itemName) => {
  return Object.keys(passes).includes(itemName)? "" : "Ticket"
}
const optionsToPassArray = (options) => { // max 2 level
  const keys = Object.keys(options)
  return keys.flatMap((key) => {
    return Object.keys(options[key]).map((subkey) => {
      return options[key][subkey] && (options[key][subkey] === true || options[key][subkey].isAvailable) ? `${key} ${subkey}` : null
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
const priceForIndividualItems = (items: any[], priceModel) => {
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
const getBestCombination = (options,priceModel) => {
  if(optionsToPassArray(options).length == 0) {
    return {price: 0, options: []}
  }
  // const passCombinations = generateAllPassCombinations(passes)
  let bestOptions = []
  let bestPrice = 999.00
  passCombinations.forEach((passCombination: any[]) => {
    const packagePrice = priceForPassCombination(passCombination,priceModel)
    const tickePrice = priceForIndividualItems(itemsNotCovered(optionsToPassArray(options),itemsFromPassCombination(passCombination)),priceModel)
    const combinedPrice = packagePrice + tickePrice
    if(combinedPrice <= bestPrice) {
      bestPrice = combinedPrice
      bestOptions = [...passCombination, ...itemsNotCovered(optionsToPassArray(options),itemsFromPassCombination(passCombination))]
    }
  })
  return {price: bestPrice, options: bestOptions}
}

export const passCombinations = generateAllPassCombinations(passes)

export { calculateTotalCost, passOrTicket, optionsToPassArray, availableOptionsForDay, isAllDayOptions, isAllPassOptions, priceForPassCombination, itemsFromPassCombination, priceForIndividualItems, itemsNotCovered, getBestCombination }

const getTicketPriceIds = () => {
  const ticketNames = Object.keys(individualTickets).reduce((returnObj,day) => {
    const keys = Object.keys(individualTickets[day])
    return {...returnObj, ...keys.reduce((returnObj,key) => {
      // [`${day} ${key}`
      return individualTickets[day][key].priceId ? {...returnObj, [`${day} ${key}`]: `${individualTickets[day][key].priceId}`} : returnObj
    },{})}
  },{}
)
  return ticketNames
}

export const priceIds = () => {
  const passPriceIds = Object.keys(passes).reduce((returnObj,key) => { 
    return {...returnObj, [key]: passes[key].priceId}
  },{})
  const ticketPriceIds = getTicketPriceIds()
  return {...passPriceIds,...ticketPriceIds}
}