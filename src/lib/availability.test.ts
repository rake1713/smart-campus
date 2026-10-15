import { describe, it, expect } from "vitest";
import { checkAvailability } from "@/lib/availability";
import type { Room, Booking, Interval, CheckOutcome } from "@/types";

const CURRENT_TIME = 540;

function makeRoom(): Room {
  return {
    id: "r1",
    name: "Test Room",
    building: "Test",
    capacity: 10,
    isBlocked: false,
  };
}

function makeBookings(): Booking[] {
  return [
    {
      id: "b1",
      roomId: "r1",
      start: 600,
      end: 660,
      title: "Sample",
      bookedBy: "Tester",
    },
  ];
}

function snapshotRoom(room: Room): Room {
  return { ...room };
}

function snapshotBookings(bookings: Booking[]): Booking[] {
  return bookings.map((b) => ({ ...b }));
}

function run(start: number, end: number): {
  outcome: CheckOutcome;
  room: Room;
  bookings: Booking[];
  roomSnapshot: Room;
  bookingsSnapshot: Booking[];
} {
  const room = makeRoom();
  const bookings = makeBookings();
  const roomSnapshot = snapshotRoom(room);
  const bookingsSnapshot = snapshotBookings(bookings);
  const outcome = checkAvailability({ start, end }, room, bookings, CURRENT_TIME);
  return { outcome, room, bookings, roomSnapshot, bookingsSnapshot };
}

function expectAvailable(outcome: CheckOutcome) {
  expect(outcome.kind).toBe("available");
}

function expectUnavailable(outcome: CheckOutcome, reasonKey: string) {
  expect(outcome.kind).toBe("unavailable");
  if (outcome.kind === "unavailable") {
    expect(outcome.reason).toContain(reasonKey);
  }
}

function assertRoomUnchanged(room: Room, snapshot: Room) {
  expect(room).toEqual(snapshot);
}

function assertBookingsUnchanged(bookings: Booking[], snapshot: Booking[]) {
  expect(bookings).toEqual(snapshot);
  expect(bookings).toHaveLength(snapshot.length);
}

describe("checkAvailability", () => {
  it("T01 660–720 touching after existing booking -> available (AC4)", () => {
    const { outcome, room, bookings, roomSnapshot, bookingsSnapshot } = run(660, 720);
    expectAvailable(outcome);
    assertRoomUnchanged(room, roomSnapshot);
    assertBookingsUnchanged(bookings, bookingsSnapshot);
  });

  it("T02 540–570 starts at current time -> unavailable (AC1)", () => {
    const { outcome, room, bookings, roomSnapshot, bookingsSnapshot } = run(540, 570);
    expectUnavailable(outcome, "current time");
    assertRoomUnchanged(room, roomSnapshot);
    assertBookingsUnchanged(bookings, bookingsSnapshot);
  });

  it("T03 720–720 zero duration -> unavailable (AC1)", () => {
    const { outcome, room, bookings, roomSnapshot, bookingsSnapshot } = run(720, 720);
    expectUnavailable(outcome, "earlier than end time");
    assertRoomUnchanged(room, roomSnapshot);
    assertBookingsUnchanged(bookings, bookingsSnapshot);
  });

  it("T04 750–720 reversed interval -> unavailable (AC1)", () => {
    const { outcome, room, bookings, roomSnapshot, bookingsSnapshot } = run(750, 720);
    expectUnavailable(outcome, "earlier than end time");
    assertRoomUnchanged(room, roomSnapshot);
    assertBookingsUnchanged(bookings, bookingsSnapshot);
  });

  it("T05 1380–1441 past day end -> unavailable (AC1)", () => {
    const { outcome, room, bookings, roomSnapshot, bookingsSnapshot } = run(1380, 1441);
    expectUnavailable(outcome, "24:00");
    assertRoomUnchanged(room, roomSnapshot);
    assertBookingsUnchanged(bookings, bookingsSnapshot);
  });

  it("T06 720–840 exactly 120 min -> available (AC2)", () => {
    const { outcome, room, bookings, roomSnapshot, bookingsSnapshot } = run(720, 840);
    expectAvailable(outcome);
    assertRoomUnchanged(room, roomSnapshot);
    assertBookingsUnchanged(bookings, bookingsSnapshot);
  });

  it("T07 720–841 121 min exceeds max -> unavailable (AC2)", () => {
    const { outcome, room, bookings, roomSnapshot, bookingsSnapshot } = run(720, 841);
    expectUnavailable(outcome, "Maximum");
    assertRoomUnchanged(room, roomSnapshot);
    assertBookingsUnchanged(bookings, bookingsSnapshot);
  });

  it("T08 570–600 touching before existing booking -> available (AC4)", () => {
    const { outcome, room, bookings, roomSnapshot, bookingsSnapshot } = run(570, 600);
    expectAvailable(outcome);
    assertRoomUnchanged(room, roomSnapshot);
    assertBookingsUnchanged(bookings, bookingsSnapshot);
  });

  it("T09 630–690 partial overlap with booking -> unavailable (AC4)", () => {
    const { outcome, room, bookings, roomSnapshot, bookingsSnapshot } = run(630, 690);
    expectUnavailable(outcome, "Overlaps");
    assertRoomUnchanged(room, roomSnapshot);
    assertBookingsUnchanged(bookings, bookingsSnapshot);
  });

  it("T10 570–690 contains existing booking -> unavailable (AC4)", () => {
    const { outcome, room, bookings, roomSnapshot, bookingsSnapshot } = run(570, 690);
    expectUnavailable(outcome, "Overlaps");
    assertRoomUnchanged(room, roomSnapshot);
    assertBookingsUnchanged(bookings, bookingsSnapshot);
  });

  it("T11 615–645 fully inside existing booking -> unavailable (AC4)", () => {
    const { outcome, room, bookings, roomSnapshot, bookingsSnapshot } = run(615, 645);
    expectUnavailable(outcome, "Overlaps");
    assertRoomUnchanged(room, roomSnapshot);
    assertBookingsUnchanged(bookings, bookingsSnapshot);
  });

  it("T12 600–660 identical interval -> unavailable (AC4)", () => {
    const { outcome, room, bookings, roomSnapshot, bookingsSnapshot } = run(600, 660);
    expectUnavailable(outcome, "Overlaps");
    assertRoomUnchanged(room, roomSnapshot);
    assertBookingsUnchanged(bookings, bookingsSnapshot);
  });

  it("T13 660–720 with room.isBlocked = true -> unavailable (AC3)", () => {
    const room = makeRoom();
    room.isBlocked = true;
    const roomSnapshot = snapshotRoom(room);
    const bookings = makeBookings();
    const bookingsSnapshot = snapshotBookings(bookings);
    const outcome = checkAvailability({ start: 660, end: 720 }, room, bookings, CURRENT_TIME);
    expectUnavailable(outcome, "blocked");
    assertRoomUnchanged(room, roomSnapshot);
    assertBookingsUnchanged(bookings, bookingsSnapshot);
  });

  it("T14 630–690 with no bookings -> available (AC4)", () => {
    const room = makeRoom();
    const roomSnapshot = snapshotRoom(room);
    const bookings: Booking[] = [];
    const bookingsSnapshot = snapshotBookings(bookings);
    const outcome = checkAvailability({ start: 630, end: 690 }, room, bookings, CURRENT_TIME);
    expectAvailable(outcome);
    assertRoomUnchanged(room, roomSnapshot);
    assertBookingsUnchanged(bookings, bookingsSnapshot);
  });

  it("T15 multiple checks leave room and roomBookings unchanged (AC5)", () => {
    const room = makeRoom();
    const roomSnapshot = snapshotRoom(room);
    const bookings = makeBookings();
    const bookingsSnapshot = snapshotBookings(bookings);
    for (const [s, e] of [
      [660, 720],
      [570, 600],
      [630, 690],
      [720, 840],
    ] as const) {
      checkAvailability({ start: s, end: e }, room, bookings, CURRENT_TIME);
    }
    assertRoomUnchanged(room, roomSnapshot);
    assertBookingsUnchanged(bookings, bookingsSnapshot);
  });

  it("T16 1320–1440 ends exactly at 24:00, 120 min -> available (AC1/AC2)", () => {
    const { outcome, room, bookings, roomSnapshot, bookingsSnapshot } = run(1320, 1440);
    expectAvailable(outcome);
    assertRoomUnchanged(room, roomSnapshot);
    assertBookingsUnchanged(bookings, bookingsSnapshot);
  });

  it("T17 700–730 overlaps second booking among 600–660 and 720–780 -> unavailable (AC4)", () => {
    const room = makeRoom();
    const roomSnapshot = snapshotRoom(room);
    const bookings: Booking[] = [
      { id: "b1", roomId: "r1", start: 600, end: 660, title: "First", bookedBy: "A" },
      { id: "b2", roomId: "r1", start: 720, end: 780, title: "Second", bookedBy: "B" },
    ];
    const bookingsSnapshot = snapshotBookings(bookings);
    const outcome = checkAvailability({ start: 700, end: 730 }, room, bookings, CURRENT_TIME);
    expectUnavailable(outcome, "Overlaps");
    assertRoomUnchanged(room, roomSnapshot);
    assertBookingsUnchanged(bookings, bookingsSnapshot);
  });

  it("T18 541–570 starts 1 minute after now -> available (AC1)", () => {
    const room = makeRoom();
    const roomSnapshot = snapshotRoom(room);
    const bookings: Booking[] = [];
    const bookingsSnapshot = snapshotBookings(bookings);
    const outcome = checkAvailability({ start: 541, end: 570 }, room, bookings, CURRENT_TIME);
    expectAvailable(outcome);
    assertRoomUnchanged(room, roomSnapshot);
    assertBookingsUnchanged(bookings, bookingsSnapshot);
  });
});
