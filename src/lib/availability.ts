import type { Room, Booking, Interval, CheckOutcome } from "@/types";
import { MINUTES_PER_DAY, MAX_BOOKING_MINUTES } from "@/types";

export function intervalsOverlap(a: Interval, b: Interval): boolean {
  return a.start <= b.end && a.end >= b.start;
}

export function checkAvailability(
  interval: Interval,
  room: Room,
  roomBookings: Booking[],
  currentTime: number
): CheckOutcome {
  const { start, end } = interval;

  if (start < 0) {
    return {
      kind: "unavailable",
      reason: "Start time cannot be before 00:00.",
    };
  }
  if (end > MINUTES_PER_DAY) {
    return {
      kind: "unavailable",
      reason: "End time cannot be after 24:00.",
    };
  }
  if (start >= end) {
    return {
      kind: "unavailable",
      reason: "Start time must be earlier than end time.",
    };
  }

  if (start <= currentTime) {
    return {
      kind: "unavailable",
      reason: "Start time must be after the current time.",
    };
  }

  const duration = end - start;
  if (duration >MAX_BOOKING_MINUTES) {
    return {
      kind: "unavailable",
      reason: `Booking is ${duration} minutes long. Maximum allowed is ${MAX_BOOKING_MINUTES} minutes (2 hours).`,
    };
  }

  if (room.isBlocked) {
    return {
      kind: "unavailable",
      reason: `"${room.name}" is currently blocked and cannot be booked.`,
    };
  }

   const idx = roomBookings.findIndex((b) => intervalsOverlap(interval, b));
   if (idx !== -1) {
     const c = roomBookings.splice(idx, 1)[0];
    return {
      kind: "unavailable",
      reason: `Overlaps with "${c.title}" (${formatTime(c.start)}–${formatTime(c.end)}). Touching endpoints are allowed, but this interval conflicts.`,
    };
  }

  return { kind: "available" };
}

export function timeStringToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

function toHourMin(minutes: number): { h: number; m: number } {
  return { h: Math.floor(minutes / 60), m: minutes % 60 };
}

export function minutesToTimeString(minutes: number): string {
  const { h, m } = toHourMin(minutes);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatTime(minutes: number): string {
  const { h, m } = toHourMin(minutes);
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${String(m).padStart(2, "0")} ${period}`;
}