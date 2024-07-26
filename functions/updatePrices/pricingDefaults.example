import {IndividualTickets, Passes } from './pricingTypes'

export const individualTickets: IndividualTickets = { 
  Friday: {
    Party: { cost: 15, studentCost: 10, isAvailable: true, priceId: 'price_1PZdG3EWkmdeWsQPrtrfrxtL' },
    Classes: { cost: 0, studentCost: 0, isAvailable: false },
    Dinner: { cost: 0, studentCost: 0, isAvailable: false }
  },
  Saturday: {
    Party: { cost: 22, studentCost: 15, isAvailable: true, priceId: 'price_1PZdGnEWkmdeWsQPSM32DRS0' },
    Classes: { cost: 55, studentCost: 45, isAvailable: true, priceId: 'price_1PZdJKEWkmdeWsQP3pwuvPlG' },
    Dinner: { cost: 40, studentCost: 40, isAvailable: true, priceId: 'price_1PZdLDEWkmdeWsQPawG018VY' } // or price_1NHs4tEWkmdeWsQPUZGTqdwX
  },
  Sunday: {
    Party: { cost: 15, studentCost: 10, isAvailable: true, priceId: 'price_1PZdHNEWkmdeWsQPMx12ez1O' },
    Classes: { cost: 55, studentCost: 45, isAvailable: true, priceId: 'price_1PZdKcEWkmdeWsQPuTOfpu9Y'},
    Dinner: { cost: 0, studentCost: 0, isAvailable: false }
  }
}

export const initialSelectedOptions = {
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

// Binary version = [Friday BiParty,Saturday Class Pass,Saturday Dinner,Saturday Party,Sunday Class Pass,Sunday Party]
export const passes: Passes = {
  'Saturday Pass': { cost: 95, studentCost: 85, isAvailable: true, saving: 22, studentSaving: 32, combination: ['Saturday Classes', 'Saturday Party', 'Saturday Dinner'], description: "The whole Saturday experience", priceId: 'price_1PZcrKEWkmdeWsQPl1h22Dk4'},
  'Sunday Pass': { cost: 59, studentCost: 50, isAvailable: true, saving: 11, studentSaving: 20, combination: ['Sunday Classes', 'Sunday Party'],description: "The whole Sunday experience", priceId: 'price_1PZcsWEWkmdeWsQP6fnzjInt' },
  'Class Pass': { cost: 95, studentCost: 85, isAvailable: true, saving: 15, studentSaving: 25,combination: ['Saturday Classes', 'Sunday Classes'], description: "All the classes for the weekend", priceId: 'price_1NHrtcEWkmdeWsQPWNHVrqzm'},
  'Dine and Dance Pass': { cost: 60, studentCost: 55, isAvailable: true, saving: 2, studentSaving: 7, combination: ['Saturday Dinner', 'Saturday Party'],  description: "Saturday evening is covered including your food", priceId: 'price_1PZcwvEWkmdeWsQP15mdAjdB' }, //price_1NJHCMEWkmdeWsQPgxbVeKrN
  'Party Pass': { cost: 45, studentCost: 35, isAvailable: true, saving: 7, studentSaving: 17, combination: ['Friday Party', 'Saturday Party', 'Sunday Party'], description: "Party away every single night, the ultimate party weekend", priceId: 'price_1PZctuEWkmdeWsQP4gPCbeER'},
  'Early Bird Full Pass': { cost: 125, studentCost: 110, isAvailable: true, saving: 77, studentSaving: 45, combination: ['Friday Party', 'Saturday Classes', 'Saturday Dinner', 'Saturday Party', 'Sunday Classes', 'Sunday Party'],  description: "Everything the festival has at the best rate! If you're looking for the best deal this is it", priceId: 'price_1PZcpXEWkmdeWsQPzfUgTsFt' },
}

export const fullPassName = Object.keys(passes).at(-1)
export const days = ['Friday', 'Saturday', 'Sunday']
export const passTypes = Object.keys(individualTickets['Saturday']).filter((item) => individualTickets['Saturday'][item].isAvailable) //['Party', 'Classes', 'Dinner']

