import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import { API_BASE_URL } from "../config/api";

const MaintenanceCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null,
  });

  // Fetch calendar data from backend
  const fetchCalendarData = async (startDate, endDate) => {
    try {
      setLoading(true);
      const start =
        startDate ||
        new Date(new Date().setDate(new Date().getDate() - 30))
          .toISOString()
          .split("T")[0];
      const end =
        endDate ||
        new Date(new Date().setDate(new Date().getDate() + 60))
          .toISOString()
          .split("T")[0];

      const response = await fetch(
        `${API_BASE_URL}/requests/views/calendar?start_date=${start}&end_date=${end}`
      );
      const data = await response.json();

      if (data.success) {
        console.log("Calendar API response:", data.data);

        // Transform backend data to FullCalendar events
        const calendarEvents = data.data
          .map((request) => {
            const isOverdue = request.is_overdue;
            const isPriority =
              request.priority === "CRITICAL" || request.priority === "HIGH";
            const isPreventive = request.request_type === "PREVENTIVE";

            // Use scheduled_date if available, otherwise use created_at
            const eventDate = request.scheduled_date || request.created_at;

            // Format date for FullCalendar (ISO date format)
            const formattedDate = eventDate
              ? new Date(eventDate).toISOString().split("T")[0]
              : null;

            if (!formattedDate) return null; // Skip if no date

            return {
              id: request.id,
              title: request.title,
              start: formattedDate,
              end: formattedDate,
              backgroundColor: isOverdue
                ? "#ef4444"
                : isPriority
                ? "#f59e0b"
                : "#6366f1",
              borderColor: isOverdue
                ? "#dc2626"
                : isPriority
                ? "#d97706"
                : "#4f46e5",
              extendedProps: {
                equipment: request.equipment_name,
                team: request.team_name,
                technician: request.assigned_to_name || "Unassigned",
                priority: request.priority,
                status: request.status,
                isOverdue: isOverdue,
                isPreventive: isPreventive,
                requestType: request.request_type,
              },
            };
          })
          .filter(Boolean); // Remove null entries
        console.log("Transformed calendar events:", calendarEvents);
        setEvents(calendarEvents);
      }
    } catch (err) {
      console.error("Failed to fetch calendar data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCalendarData();
  }, []);

  // Handle date range changes when user navigates
  const handleDatesSet = (dateInfo) => {
    const start = dateInfo.start.toISOString().split("T")[0];
    const end = dateInfo.end.toISOString().split("T")[0];

    // Only fetch if date range changed significantly
    if (start !== dateRange.start || end !== dateRange.end) {
      setDateRange({ start, end });
      fetchCalendarData(start, end);
    }
  };

  return (
    /* 🔹 SAME PAGE BACKGROUND AS DASHBOARD */
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 relative overflow-hidden">
      {/* Indigo glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent pointer-events-none" />

      <main className="relative max-w-7xl mx-auto p-8 animate-in fade-in duration-700">
        {/* Legend */}
        <div className="mb-6 flex flex-wrap items-center gap-4 backdrop-blur-xl bg-gray-800/20 border border-gray-700/30 rounded-2xl p-4 shadow-xl">
          <span className="text-sm font-bold text-gray-400 mr-2">Legend:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/40"></div>
            <span className="text-xs text-gray-300">Overdue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500/20 border border-orange-500/40"></div>
            <span className="text-xs text-gray-300">High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-indigo-500/20 border border-indigo-500/40"></div>
            <span className="text-xs text-gray-300">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">🔧</span>
            <span className="text-xs text-gray-300">Preventive</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">⚠️</span>
            <span className="text-xs text-gray-300">Overdue Alert</span>
          </div>
        </div>

        {/* Glass container */}
        <div className="backdrop-blur-3xl bg-gray-900/20 border border-gray-700/30 rounded-3xl shadow-2xl overflow-hidden relative">
          {" "}
          {loading && (
            <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}
          <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin, dayGridPlugin]}
            initialView="dayGridMonth"
            height="auto"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            slotMinTime="06:00:00"
            slotMaxTime="23:00:00"
            nowIndicator={true}
            allDaySlot={false}
            firstDay={0}
            events={events}
            datesSet={handleDatesSet}
            eventContent={(eventInfo) => {
              const props = eventInfo.event.extendedProps;
              const isOverdue = props.isOverdue;
              const isPriority =
                props.priority === "CRITICAL" || props.priority === "HIGH";

              return (
                <div
                  className={`
                    h-full rounded-xl px-2 py-1 text-xs font-bold
                    ${
                      isOverdue
                        ? "bg-red-500/20 border border-red-500/40 text-red-300"
                        : isPriority
                        ? "bg-orange-500/20 border border-orange-500/40 text-orange-300"
                        : "bg-indigo-500/20 border border-indigo-500/40 text-indigo-300"
                    }
                  `}
                  title={`${eventInfo.event.title}\nEquipment: ${props.equipment}\nTechnician: ${props.technician}\nStatus: ${props.status}`}
                >
                  <div className="flex items-center gap-1">
                    {props.isPreventive && (
                      <span className="text-[10px]">🔧</span>
                    )}
                    {isOverdue && <span className="text-[10px]">⚠️</span>}
                    <p className="truncate flex-1">{eventInfo.event.title}</p>
                  </div>
                  <p className="text-[10px] opacity-70 truncate">
                    {props.technician}
                  </p>
                  {eventInfo.view.type !== "dayGridMonth" && (
                    <p className="text-[9px] opacity-60 truncate">
                      {props.equipment}
                    </p>
                  )}
                </div>
              );
            }}
            dayHeaderClassNames="text-xs uppercase tracking-widest text-gray-500"
            slotLabelClassNames="text-xs text-gray-500"
            dayHeaderFormat={{
              weekday: "short",
              day: "numeric",
            }}
            themeSystem="standard"
          />
        </div>
      </main>
    </div>
  );
};

export default MaintenanceCalendar;
