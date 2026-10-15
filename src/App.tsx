import { useMemo, useState } from "react";
import {
  Clock,
  DoorClosed,
  Users,
  Ban,
  CheckCircle2,
  XCircle,
  MapPin,
  CalendarCheck,
  Info,
} from "lucide-react";
import type { Room, Booking, CheckOutcome } from "@/types";
import { MAX_BOOKING_MINUTES } from "@/types";
import { rooms as initialRooms, bookings as initialBookings } from "@/data";
import {
  checkAvailability,
  timeStringToMinutes,
  minutesToTimeString,
  formatTime,
} from "@/lib/availability";

function minutesNow(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function App() {
  const [rooms] = useState<Room[]>(initialRooms);
  const [bookings] = useState<Booking[]>(initialBookings);
  const [currentTime] = useState(minutesNow);

  const [selectedRoomId, setSelectedRoomId] = useState<string>(initialRooms[0].id);
  const [startTime, setStartTime] = useState<string>(
    minutesToTimeString(Math.ceil(currentTime / 30) * 30 + 30)
  );
  const [endTime, setEndTime] = useState<string>(
    minutesToTimeString(Math.ceil(currentTime / 30) * 30 + 90)
  );

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === selectedRoomId)!,
    [rooms, selectedRoomId]
  );

  const roomBookings = useMemo(
    () => bookings.filter((b) => b.roomId === selectedRoomId),
    [bookings, selectedRoomId]
  );

  const outcome: CheckOutcome | null = useMemo(() => {
    const start = timeStringToMinutes(startTime);
    const end = timeStringToMinutes(endTime);
    return checkAvailability({ start, end }, selectedRoom, roomBookings, currentTime);
  }, [startTime, endTime, selectedRoom, roomBookings, currentTime]);

  const duration = timeStringToMinutes(endTime) - timeStringToMinutes(startTime);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Smart Campus Room Availability
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Check whether a room is free for your desired time slot.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Form */}
        <section className="lg:col-span-3 space-y-5">
          {/* Current time banner */}
          <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
            <Clock className="w-5 h-5 text-teal-600 shrink-0" />
            <p className="text-sm text-teal-800">
              Current time: <span className="font-semibold">{formatTime(currentTime)}</span> —
              bookings must start after this.
            </p>
          </div>

          {/* Room selector */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2">
              <DoorClosed className="w-5 h-5 text-teal-600" />
              <h2 className="font-semibold text-slate-900">Select a Room</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rooms.map((room) => {
                const isSelected = room.id === selectedRoomId;
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    disabled={room.isBlocked}
                    className={[
                      "text-left rounded-xl border p-4 transition-all",
                      room.isBlocked
                        ? "border-slate-200 bg-slate-50 cursor-not-allowed opacity-70"
                        : isSelected
                        ? "border-teal-500 bg-teal-50 ring-2 ring-teal-200"
                        : "border-slate-200 bg-white hover:border-teal-300 hover:shadow-sm",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-slate-900 truncate">{room.name}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{room.building}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500">
                          <Users className="w-3 h-3 shrink-0" />
                          <span>Capacity {room.capacity}</span>
                        </div>
                      </div>
                      {room.isBlocked && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5 shrink-0">
                          <Ban className="w-3 h-3" /> Blocked
                        </span>
                      )}
                      {!room.isBlocked && isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time interval */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              <h2 className="font-semibold text-slate-900">Pick a Time Interval</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Start time</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">End time</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition"
                />
              </label>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2.5">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                Max {MAX_BOOKING_MINUTES} minutes per booking. Touching endpoints (e.g.
                10:00–11:00 next to 11:00–12:00) are allowed.
              </span>
            </div>
          </div>

          {/* Result */}
          {outcome && (
            <div
              className={[
                "rounded-2xl border p-5 transition-all",
                outcome.kind === "available"
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-red-200 bg-red-50",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                {outcome.kind === "available" ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <p
                    className={[
                      "text-base font-bold",
                      outcome.kind === "available" ? "text-emerald-700" : "text-red-700",
                    ].join(" ")}
                  >
                    {outcome.kind === "available" ? "Available" : "Unavailable"}
                  </p>
                  <p
                    className={[
                      "text-sm mt-0.5",
                      outcome.kind === "available" ? "text-emerald-700" : "text-red-700",
                    ].join(" ")}
                  >
                    {outcome.kind === "available"
                      ? `"${selectedRoom.name}" is free from ${formatTime(
                          timeStringToMinutes(startTime)
                        )} to ${formatTime(timeStringToMinutes(endTime))} (${duration} min).`
                      : outcome.reason}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Right: Schedule */}
        <aside className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 lg:sticky lg:top-6">
            <div className="flex items-center gap-2 mb-1">
              <CalendarCheck className="w-5 h-5 text-teal-600" />
              <h2 className="font-semibold text-slate-900">Today's Schedule</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">{selectedRoom.name}</p>

            {roomBookings.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No bookings for this room today.</p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {roomBookings
                  .sort((a, b) => a.start - b.start)
                  .map((b) => (
                    <li
                      key={b.id}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"
                    >
                      <div className="flex flex-col items-center justify-center w-14 shrink-0">
                        <span className="text-xs font-bold text-teal-700">
                          {formatTime(b.start).replace(/:\d{2} /, " ")}
                        </span>
                        <span className="text-[10px] text-slate-400">to</span>
                        <span className="text-xs font-bold text-teal-700">
                          {formatTime(b.end).replace(/:\d{2} /, " ")}
                        </span>
                      </div>
                      <div className="min-w-0 border-l border-slate-200 pl-3">
                        <p className="text-sm font-medium text-slate-800 truncate">{b.title}</p>
                        <p className="text-xs text-slate-500 truncate">{b.bookedBy}</p>
                      </div>
                    </li>
                  ))}
              </ul>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Sample data only — checking does not modify bookings.</span>
            </div>
          </div>
        </aside>
      </main>

      <footer className="max-w-5xl mx-auto px-4 sm:px-6 pb-8 text-center text-xs text-slate-400">
        Smart Campus · Fictional sample data for demonstration purposes.
      </footer>
    </div>
  );
}

export default App;
