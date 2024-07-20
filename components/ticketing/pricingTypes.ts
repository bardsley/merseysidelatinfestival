export type Ticket = {
  cost: number;
  studentCost: number;
  isAvailable: boolean;
};
export type DayTickets = {
  Party: Ticket;
  Classes: Ticket;
  Dinner: Ticket;
};
export type IndividualTickets = {
  Friday: DayTickets;
  Saturday: DayTickets;
  Sunday: DayTickets;
};
export type SelectedOptions = {
  Friday: { Party: boolean; Classes: boolean; Dinner: boolean };
  Saturday: { Party: boolean; Classes: boolean; Dinner: boolean };
  Sunday: { Party: boolean; Classes: boolean; Dinner: boolean };
};
export type Pass = {
  cost: number;
  studentCost: number;
  isAvailable: boolean;
  saving: number;
  combination: string[];
  description?: string;
  included?: string[];
};
export type Passes = { [key: string]: Pass };