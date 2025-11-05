export type CalendarItem = {
  id: string;
  service: string;
  customer: string;
  dateTimeStart: string; // ISO
  durationMin: number;
};

export type SaleItem = {
  id: string;
  item: string;
  qty: number;
  amount: number; // número
  date: string;   // ISO (solo fecha o full ISO)
};
