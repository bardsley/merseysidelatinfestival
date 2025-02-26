export  { individualTickets, passes } from './pricingDefaultsDynamic'
import { individualTickets, passes } from './pricingDefaultsDynamic'
import type { PartialSelectedOptions } from './pricingTypes'

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
  },
  NextYear: {
    Party: false,
    Classes: false,
    Dinner: false
  },
  NextYearPartner: {
    Party: false,
    Classes: false,
    Dinner: false
  }    
} as PartialSelectedOptions

export const fullPassName = '2025 Full Pass (with dinner)' //! Replaced to stop couples pass jumping to top
// export const fullPassName = Object.keys(passes).filter((pass) => { return passes[pass].isAvailable }).reduce((passInfo,passName) => {
//   const pass = passes[passName]
//   return pass.cost > passInfo.cost ? { passName: passName, cost: pass.cost } : passInfo
// },{passName:'None',cost:0 }).passName //at(4)
export const days = ['Friday', 'Saturday', 'Sunday', 'NextYear','NextYearPartner']
// export const passTypes = Object.keys(individualTickets['Saturday']).filter((item) => individualTickets['Saturday'][item].isAvailable) //['Party', 'Classes', 'Dinner']

export const passTypes = ['Party', 'Classes', 'Dinner'].filter((item) => individualTickets['NextYear'][item].isAvailable)