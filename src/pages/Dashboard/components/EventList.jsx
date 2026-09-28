import React from 'react';
import { FaCalendarAlt } from 'react-icons/fa';

const EventList = ({ events = [], onViewCalendar }) => {
  const hasEvents = Array.isArray(events) && events.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-800">Upcoming Events</h3>
        <button 
          onClick={onViewCalendar}
          className="text-sm font-medium text-orange-600 hover:text-orange-700 cursor-pointer"
        >
          View Calendar
        </button>
      </div>
      <div className="p-4 flex-1 flex flex-col gap-4 min-h-[220px]">
        {!hasEvents ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-400 my-auto">
            <FaCalendarAlt className="text-3xl text-orange-400 mb-2 opacity-80" />
            <p className="text-sm font-medium text-gray-600">No events scheduled</p>
            <p className="text-xs text-gray-400 mt-1">Click View Calendar to view or organize community events.</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center justify-center min-w-[50px]">
                <span className="text-2xl font-bold text-orange-500 leading-none">{event.date}</span>
                <span className="text-xs font-semibold text-gray-500 tracking-wider">{event.month}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-800 mb-1 truncate">{event.title}</h4>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-1 truncate">
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  {event.location}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {event.time}
                </p>
              </div>
              <div className="flex items-center justify-center w-10 h-10 bg-orange-50 rounded-full shrink-0">
                <img src={event.image || 'https://cdn-icons-png.flaticon.com/512/3884/3884632.png'} alt="event icon" className="w-6 h-6 object-contain" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventList;
