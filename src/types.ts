export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  isBlocked: boolean;
}

export interface Booking {
  id: string;
  roomId: string;
  start: number;
  end: number;
  title: string;
  bookedBy: string;
}

export interface Interval {
  start: number;
  end: number;
}

export type CheckOutcome =
  | { kind: "available" }
  | { kind: "unavailable"; reason: string };

export const MINUTES_PER_DAY = 1440;
export const MAX_BOOKING_MINUTES = 120;
