import React from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';

const MaintenanceCalendar = () => {
  return (
    /* 🔹 SAME PAGE BACKGROUND AS DASHBOARD */
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 relative overflow-hidden">
      {/* Indigo glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent pointer-events-none" />

      <main className="relative max-w-7xl mx-auto p-8 animate-in fade-in duration-700">
        {/* Glass container */}
        <div className="backdrop-blur-3xl bg-gray-900/20 border border-gray-700/30 rounded-3xl shadow-2xl overflow-hidden">

          <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin, dayGridPlugin]}
            initialView="timeGridWeek"
            height="auto"

            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'timeGridWeek,timeGridDay'
            }}

            slotMinTime="06:00:00"
            slotMaxTime="23:00:00"
            nowIndicator={true}
            allDaySlot={false}
            firstDay={0}

            events={[
              {
                title: 'Hydraulic Check',
                start: '2025-12-18T18:00:00',
                end: '2025-12-18T19:30:00',
                extendedProps: {
                  technician: 'Mitchell',
                  priority: 'normal'
                }
              },
              {
                title: 'Server Overheat',
                start: '2025-12-20T14:00:00',
                end: '2025-12-20T16:00:00',
                extendedProps: {
                  technician: 'Marc',
                  priority: 'critical'
                }
              }
            ]}

            eventContent={(eventInfo) => {
              const isCritical =
                eventInfo.event.extendedProps.priority === 'critical';

              return (
                <div
                  className={`
                    h-full rounded-xl px-2 py-1 text-xs font-bold
                    ${
                      isCritical
                        ? 'bg-red-500/20 border border-red-500/40 text-red-300'
                        : 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300'
                    }
                  `}
                >
                  <p className="truncate">{eventInfo.event.title}</p>
                  <p className="text-[10px] opacity-70">
                    {eventInfo.event.extendedProps.technician}
                  </p>
                </div>
              );
            }}

            dayHeaderClassNames="text-xs uppercase tracking-widest text-gray-500"
            slotLabelClassNames="text-xs text-gray-500"

            dayHeaderFormat={{
              weekday: 'short',
              day: 'numeric'
            }}

            themeSystem="standard"
          />
        </div>
      </main>
    </div>
  );
};

export default MaintenanceCalendar;
