import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const MaintenanceCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  // Sample maintenance events
  const events = [
    { id: 1, title: 'Equipment Check - Server Room', date: '2025-01-15', category: 'Critical' },
    { id: 2, title: 'Routine Inspection - HVAC', date: '2025-01-20', category: 'Routine' },
    { id: 3, title: 'Technician Training', date: '2025-01-25', category: 'Team' },
    // Add more events as needed
  ];

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const days = [];
    for (let i = 0; i < 42; i++) { // 6 weeks
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 to-transparent" />

      {/* Top Navigation */}
      <nav className="backdrop-blur-lg bg-gray-800/30 border-b border-gray-600/40 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-8">
            <Link to="/dashboard" className="px-3 py-2 text-lg font-medium text-gray-300 hover:text-gray-100 transition-colors">
              Dashboard
            </Link>
            <Link to="/calendar" className="px-3 py-2 text-lg font-bold text-gray-100 border-b-2 border-indigo-500">
              Maintenance Calendar
            </Link>
            <Link to="/reporting" className="px-3 py-2 text-lg font-medium text-gray-300 hover:text-gray-100 transition-colors">
              Equipment Reporting
            </Link>
            <Link to="/teams" className="px-3 py-2 text-lg font-medium text-gray-300 hover:text-gray-100 transition-colors">
              Teams
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search events..."
              className="px-4 py-2 bg-gray-700/20 border border-gray-600/30 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6 space-y-8">
        {/* Calendar Header */}
        <div className="backdrop-blur-lg bg-gray-800/30 border border-gray-600/40 rounded-2xl p-6 shadow-2xl shadow-black/30 text-center">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2 text-gray-400 hover:text-gray-100 transition-colors"
            >
              ←
            </button>
            <h2 className="text-3xl font-bold text-gray-100">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 text-gray-400 hover:text-gray-100 transition-colors"
            >
              →
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-1 text-center mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-lg font-medium text-gray-300 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              const dayEvents = getEventsForDate(day);
              if (!dayEvents.length && !isCurrentMonth) return null; // Hide empty prev/next month days

              return (
                <div
                  key={index}
                  className={`relative p-2 h-24 rounded-xl transition-all cursor-pointer hover:bg-gray-700/20 ${
                    isCurrentMonth ? 'bg-gray-700/10' : 'bg-transparent'
                  }`}
                >
                  <div className={`text-lg font-bold ${day.getDate() === new Date().getDate() && isCurrentMonth ? 'text-indigo-400' : 'text-gray-400'}`}>
                    {day.getDate()}
                  </div>
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className={`mt-1 px-2 py-1 rounded-lg text-xs font-medium ${
                        event.category === 'Critical' ? 'bg-red-600/20 text-red-300' :
                        event.category === 'Routine' ? 'bg-blue-600/20 text-blue-300' :
                        'bg-green-600/20 text-green-300'
                      }`}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Events List (filtered by search) */}
        <div className="backdrop-blur-lg bg-gray-800/30 border border-gray-600/40 rounded-2xl p-6 shadow-2xl shadow-black/30">
          <h3 className="text-2xl font-bold text-gray-100 mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {events
              .filter(event => event.title.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(event => (
                <div key={event.id} className="flex items-center justify-between p-4 bg-gray-700/20 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-100">{event.title}</p>
                    <p className="text-sm text-gray-400">{event.date}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    event.category === 'Critical' ? 'bg-red-600/30 text-red-300' :
                    event.category === 'Routine' ? 'bg-blue-600/30 text-blue-300' :
                    'bg-green-600/30 text-green-300'
                  }`}>
                    {event.category}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MaintenanceCalendar;