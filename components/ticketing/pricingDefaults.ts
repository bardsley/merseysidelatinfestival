export  { individualTickets, passes } from './pricingDefaultsDynamic'
import { individualTickets, passes } from './pricingDefaultsDynamic'

export const initialSelectedOptions = {
  Friday: {
    Party: false,
    // Classes: false,
    // Dinner: false
  },
  Saturday: {
    Party: false,
    Classes: false,
    Dinner: false
  },
  Sunday: {
    Party: false,
    Classes: false,
    // Dinner: false
  }
}

export const fullPassName = Object.keys(passes).at(4)
export const days = ['Friday', 'Saturday', 'Sunday']
export const passTypes = Object.keys(individualTickets['Saturday']).filter((item) => individualTickets['Saturday'][item].isAvailable) //['Party', 'Classes', 'Dinner']

