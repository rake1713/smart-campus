import type { Room, Booking } from "@/types";

export const rooms: Room[] = [
  { id: "R1", name: "Theta Hall 101", building: "Theta Hall", capacity: 30, isBlocked: false },
  { id: "R2", name: "Innovation Lab", building: "Knight Center", capacity: 24, isBlocked: false },
  { id: "R3", name: "Auditorium A", building: "Main Quad", capacity: 120, isBlocked: false },
  { id: "R4", name: "Seminar Room 3B", building: "Whitfield Block", capacity: 12, isBlocked: true },
  { id: "R5", name: "Design Studio", building: "Knight Center", capacity: 18, isBlocked: false },
  { id: "R6", name: "Lecture Hall 220", building: "Theta Hall", capacity: 80, isBlocked: false },
];

export const bookings: Booking[] = [
  { id: "B1", roomId: "R1", start: 540, end: 600, title: "Intro to Algorithms", bookedBy: "Prof. Chen" },
  { id: "B2", roomId: "R1", start: 720, end: 780, title: "Faculty Meeting", bookedBy: "Dr. Okafor" },
  { id: "B3", roomId: "R2", start: 600, end: 660, title: "Robotics Workshop", bookedBy: "Lab Asst. Park" },
  { id: "B4", roomId: "R2", start: 900, end: 960, title: "Hackathon Prep", bookedBy: "CS Society" },
  { id: "B5", roomId: "R3", start: 480, end: 540, title: "Guest Lecture: AI Ethics", bookedBy: "Dean Martinez" },
  { id: "B6", roomId: "R3", start: 840, end: 960, title: "Film Screening", bookedBy: "Media Club" },
  { id: "B7", roomId: "R5", start: 660, end: 720, title: "UX Critique Session", bookedBy: "Prof. Lee" },
  { id: "B8", roomId: "R5", start: 1020, end: 1080, title: "Portfolio Review", bookedBy: "Prof. Lee" },
  { id: "B9", roomId: "R6", start: 540, end: 660, title: "Calculus II Lecture", bookedBy: "Prof. Singh" },
  { id: "B10", roomId: "R6", start: 780, end: 840, title: "Office Hours", bookedBy: "Prof. Singh" },
];
