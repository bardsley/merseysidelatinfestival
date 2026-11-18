import { ReactNode } from "react";
import { BiSolidBadgeCheck } from "react-icons/bi";
import TicketIcon from '@public/ticket.svg';

export type line_item = {
  description: string,
}

export type WristBandKey =
  | 'meal'
  | 'friday'
  | 'artist'
  | 'staff'
  | 'fullPass'
  | 'partyPass'
  | 'classPass'
  | 'saturdayPass'
  | 'sundayPass'
  | 'saturdayClass'
  | 'saturdayParty'
  | 'sundayClass'
  | 'sundayParty'

export type WristBand = {
  key: WristBandKey,
  colour: string,
  name: string,
  icon?: ReactNode,
}

// Ordered as they should be displayed
export const WRISTBANDS: WristBand[] = [
  { key: 'meal',          colour: "bg-white text-black",               name: "Dinner - Ticket", icon: <TicketIcon className="w-8 h-8"/> },
  { key: 'friday',        colour: "bg-black border border-gray-600",   name: "Friday - Stamp",  icon: <BiSolidBadgeCheck className="w-8 h-8"/> },
  { key: 'artist',        colour: "bg-blue-600",                       name: "Artist Pass - Plastic" },
  { key: 'staff',         colour: "bg-blue-600",                       name: "Staff/Volunteer Pass - Plastic" },
  { key: 'fullPass',      colour: "bg-gray-300 text-black",            name: "Full Pass - Plastic" },
  { key: 'partyPass',     colour: "bg-orange-700",                     name: "Party Pass - Plastic" },
  { key: 'classPass',     colour: "bg-orange-400 text-black",          name: "Class Pass - Paper" },
  { key: 'saturdayPass',  colour: "bg-purple-700",                     name: "Saturday Pass - Plastic" },
  { key: 'sundayPass',    colour: "bg-yellow-300 text-black",          name: "Sunday Pass - Paper" },
  { key: 'saturdayClass', colour: "bg-pink-400 text-black",            name: "Saturday Class - Paper" },
  { key: 'saturdayParty', colour: "bg-green-950",                      name: "Saturday Party - Paper" },
  { key: 'sundayClass',   colour: "bg-green-400",                      name: "Sunday Class - Plastic" },
  { key: 'sundayParty',   colour: "bg-blue-800",                       name: "Sunday Party - Paper" },
]

const hasItem = (line_items: line_item[], ...patterns: RegExp[]) =>
  line_items.some((li) => patterns.some((pattern) => pattern.test(li.description)))

// Access code positions:
// fri party, sat class, sat din, sat party, sun class, sun party
//    0           1         2         3         4           5
export const accessToWristbandKeys = (accessCode: number[] = [], line_items: line_item[] = []): WristBandKey[] => {
  const access = (i: number) => (accessCode[i] ?? 0) > 0

  const meal = access(2)
  const friday = access(0)

  const artist = hasItem(line_items, /Artist/)
  const staffPass = hasItem(line_items, /Staff/, /Volunteer/)
  const fullPass = hasItem(line_items, /Full/)
  const fullPassLike = artist || staffPass || fullPass

  // Note: && binds tighter than ||, so each is "named line item OR (access combination AND not full-pass-like)"
  const partyPass = hasItem(line_items, /Party\sPass/) || (access(0) && access(3) && access(5) && !fullPassLike)
  const classPass = hasItem(line_items, /Class\sPass/) || (access(1) && access(4) && !fullPassLike)
  const saturdayPass = hasItem(line_items, /Saturday\sPass/) || (access(1) && access(3) && !fullPassLike)
  const sundayPass = hasItem(line_items, /Sunday\sPass/) || (access(4) && access(5) && !fullPassLike)
  const saturdayClass = hasItem(line_items, /Saturday\s-\sClass/) || (access(1) && !saturdayPass && !classPass && !fullPassLike)
  const saturdayParty = hasItem(line_items, /Saturday\s-\sParty/, /Dine\sand\sDance\sPass/) || (access(3) && !saturdayPass && !partyPass && !fullPassLike)
  const sundayClass = hasItem(line_items, /Sunday\s-\sClass/) || (access(4) && !sundayPass && !classPass && !fullPassLike)
  const sundayParty = hasItem(line_items, /Sunday\s-\sParty/) || (access(5) && !sundayPass && !partyPass && !fullPassLike)

  const flags: Record<WristBandKey, boolean> = {
    meal,
    friday: friday && !artist && !staffPass && !fullPass && !partyPass,
    artist,
    staff: staffPass,
    fullPass,
    partyPass,
    classPass,
    saturdayPass,
    sundayPass,
    saturdayClass,
    saturdayParty,
    sundayClass,
    sundayParty,
  }

  return WRISTBANDS.filter((band) => flags[band.key]).map((band) => band.key)
}

export const accessToWristbands = (accessCode: number[] = [], line_items: line_item[] = []): WristBand[] => {
  const keys = accessToWristbandKeys(accessCode, line_items)
  return WRISTBANDS.filter((band) => keys.includes(band.key))
}
