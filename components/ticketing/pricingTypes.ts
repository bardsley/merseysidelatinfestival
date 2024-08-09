export type Ticket = {
  cost: number;
  studentCost: number;
  isAvailable: boolean;
  priceId?: string;
  studentPriceId?: string;
};

export type DayTickets = {
  Party: Ticket;
  Classes?: Ticket;
  Dinner?: Ticket;
};
export type IndividualTickets = {
  Friday: DayTickets;
  Saturday: DayTickets;
  Sunday: DayTickets;
};

export type PartialDayOption = { Party: boolean; Classes?: boolean; Dinner?: boolean; }
export type PartialSelectedOptions = {
  Friday?: PartialDayOption;
  Saturday?: PartialDayOption;
  Sunday?: PartialDayOption;
};

export type Pass = {
  cost: number;
  studentCost: number;
  isAvailable: boolean;
  saving: number;
  studentSaving?: number;
  combination: string[];
  description?: string;
  included?: string[];
  priceId?: string
  studentPriceId?: string
};
export type Passes = { [key: string]: Pass };