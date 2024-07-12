import {IndividualTickets, Passes } from './pricingTypes'

export const individualTickets: IndividualTickets = { 
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


export const passes: Passes = {
  'Saturday Pass': { cost: 95, studentCost: 85, isAvailable: true, saving: 22, combination: ['Saturday Classes', 'Saturday Party', 'Saturday Dinner'] },
  'Sunday Pass': { cost: 59, studentCost: 50, isAvailable: true, saving: 11, combination: ['Sunday Pass', 'Sunday Party'] },
  'Class Pass': { cost: 95, studentCost: 85, isAvailable: true, saving: 15, combination: ['Saturday Classes', 'Sunday Classes'] },
  'Dine and Dance Pass': { cost: 60, studentCost: 55, isAvailable: true, saving: 2, combination: ['Saturday Dinner', 'Saturday Party'] },
  'Party Pass': { cost: 45, studentCost: 35, isAvailable: true, saving: 7, combination: ['Friday Party', 'Saturday Party', 'Sunday Party'] },
  'Early Bird Full Pass': { cost: 125, studentCost: 110, isAvailable: true, saving: 77, combination: ['Friday Party', 'Saturday Classes', 'Saturday Dinner', 'Saturday Party', 'Sunday Classes', 'Sunday Party'] },
}
export const fullPassName = Object.keys(passes).at(-1)
export const days = ['Friday', 'Saturday', 'Sunday']
export const passTypes = ['Party', 'Classes', 'Dinner']