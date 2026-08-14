import React from 'react';

const EventList = () => {
  const events = [
    {
      id: 1,
      date: '15',
      month: 'SEP',
      title: 'Ganesh Chaturthi Celebration',
      location: 'Community Hall, Tower A',
      time: '6:00 PM Onwards',
      image: 'https://cdn-icons-png.flaticon.com/512/3884/3884632.png' // Placeholder for Ganesh icon
    },
    {
      id: 2,
      date: '18',
      month: 'MAY',
      title: 'Yoga Session',
      location: 'Clubhouse',
      time: '7:00 AM - 8:00 AM',
      image: 'https://cdn-icons-png.flaticon.com/512/3048/3048386.png' // Placeholder for Yoga icon
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-800">Upcoming Events</h3>
        <a href="#" className="text-sm font-medium text-orange-600 hover:text-orange-700">View Calendar</a>
      </div>
      <div className="p-4 flex-1 flex flex-col gap-4">
        {events.map((event) => (
          <div key={event.id} className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center justify-center min-w-[50px]">
              <span className="text-2xl font-bold text-orange-500 leading-none">{event.date}</span>
              <span className="text-xs font-semibold text-gray-500 tracking-wider">{event.month}</span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-800 mb-1">{event.title}</h4>
              <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                {event.location}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {event.time}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-orange-50 rounded-full">
              <img src={event.image} alt="event icon" className="w-8 h-8 object-contain" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;
