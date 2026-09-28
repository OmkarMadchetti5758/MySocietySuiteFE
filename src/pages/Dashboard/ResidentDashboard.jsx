import React from 'react';
import { 
  CloudSun, Users, Sparkles, ShieldCheck, 
  Megaphone, Receipt, Headset, CalendarRange, 
  MessageSquare, ChevronRight, PartyPopper
} from 'lucide-react';

const ResidentDashboard = ({ userName = 'Ritesh', societyName = 'Green Valley Society', flatDetails = 'Building A, Flat 101' }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Greeting Banner */}
      <section className="bg-[#FFF8F3] rounded-2xl p-6 md:p-8 relative overflow-hidden border border-orange-100/50 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Good Morning, <span className="text-[#EA580C]">{userName}</span> 👋
          </h1>
          <h2 className="text-lg font-bold text-gray-800 mt-2">{societyName}</h2>
          <p className="text-sm text-gray-600 mt-1">{flatDetails}</p>
        </div>
        <div className="text-right flex items-center gap-4 relative z-10">
          <CloudSun className="w-12 h-12 text-yellow-500 fill-yellow-100" strokeWidth={1.5} />
          <div className="text-left">
            <div className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tighter">
              28°<span className="text-xl md:text-2xl font-medium text-gray-800">C</span>
            </div>
            <p className="text-sm text-gray-500 font-medium mt-1">Partly Cloudy</p>
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none w-1/2 h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply"></div>
      </section>

      {/* Metrics Row (Single Card with Dividers) */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 md:p-0">
        <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {[
            { icon: Users, color: 'text-[#EA580C]', label: 'Visitors', value: '12', subtext: 'Today' },
            { icon: Sparkles, color: 'text-green-500', label: 'Cleaning', value: '85%', subtext: 'Completed' },
            { icon: ShieldCheck, color: 'text-blue-500', label: 'Security', value: 'All Good', subtext: 'Active' },
            { icon: Megaphone, color: 'text-purple-500', label: 'Notices', value: '3', subtext: 'New' },
            { icon: Receipt, color: 'text-red-500', label: 'Dues', value: '₹2,450', subtext: 'View', valueColor: 'text-gray-900', subtextColor: 'text-gray-400' },
          ].map((item, idx) => (
            <div key={idx} className="p-4 md:p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50/50 transition-colors group">
              <item.icon className={`w-8 h-8 mb-3 ${item.color} group-hover:scale-110 transition-transform`} strokeWidth={1.5} />
              <span className="text-sm font-bold text-gray-800 mb-1">{item.label}</span>
              <span className={`text-xl font-black ${item.valueColor || 'text-gray-900'} leading-none`}>{item.value}</span>
              <span className={`text-xs font-medium mt-1.5 ${item.subtextColor || 'text-gray-400'}`}>{item.subtext}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Area (Actions & Events) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Quick Actions */}
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
              <button className="text-sm font-bold text-[#EA580C] hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {[
                { icon: Users, color: 'text-[#EA580C]', border: 'border-orange-200', label: 'My Visitors' },
                { icon: Headset, color: 'text-green-500', border: 'border-green-200', label: 'Raise Complaint' },
                { icon: CalendarRange, color: 'text-blue-500', border: 'border-blue-200', label: 'Amenities Booking' },
                { icon: Receipt, color: 'text-[#EA580C]', border: 'border-orange-200', label: 'Maintenance Bill', badge: 1 },
                { icon: MessageSquare, color: 'text-purple-500', border: 'border-purple-200', label: 'Help Desk' },
              ].map((action, idx) => (
                <button key={idx} className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group">
                  <div className={`w-12 h-12 rounded-full border-2 ${action.border} flex items-center justify-center mb-3 ${action.color} group-hover:scale-110 transition-transform relative bg-white shadow-sm`}>
                    <action.icon className="w-5 h-5" strokeWidth={2} />
                    {action.badge && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#EA580C] rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white leading-none">{action.badge}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-bold text-gray-700 text-center leading-tight">
                    {action.label.split(' ').map((word, i) => <React.Fragment key={i}>{word}<br/></React.Fragment>)}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Bottom Split (Updates & Events) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Important Updates */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">Important Updates</h3>
                <button className="text-sm font-bold text-[#EA580C] hover:underline">View All</button>
              </div>
              <div className="space-y-4 flex-1">
                {[
                  { icon: PartyPopper, color: 'text-[#EA580C]', bg: 'bg-orange-50', title: 'Ganesh Chaturthi Celebration', desc: 'Community event on 15th Sept. All are invited!', date: '15 Sep 2024' },
                  { icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-50', title: 'Gate Security Upgrade', desc: 'New security system installation this weekend.', date: '14 Sep 2024' },
                  { icon: Sparkles, color: 'text-green-500', bg: 'bg-green-50', title: 'Deep Cleaning Drive', desc: 'Deep cleaning of all towers on 18th Sept.', date: '18 Sep 2024' },
                ].map((update, idx) => (
                  <div key={idx} className="flex items-start gap-4 group cursor-pointer border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <div className={`w-12 h-12 rounded-xl ${update.bg} flex items-center justify-center ${update.color} shrink-0 group-hover:scale-105 transition-transform border border-white shadow-sm`}>
                      <update.icon className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h4 className="text-sm font-bold text-gray-900 truncate">{update.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 truncate">{update.desc}</p>
                      <div className={`flex items-center gap-1.5 mt-2 ${update.color}`}>
                        <CalendarRange className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold">{update.date}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 mt-3 group-hover:text-gray-500 transition-colors" />
                  </div>
                ))}
              </div>
            </section>

            {/* Upcoming Events */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">Upcoming Events</h3>
                <button className="text-sm font-bold text-[#EA580C] hover:underline">View Calendar</button>
              </div>
              <div className="bg-[#FFF8F3] rounded-2xl p-5 relative overflow-hidden border border-orange-100/50 flex flex-col shadow-inner">
                <div className="flex gap-4 relative z-10">
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-black text-[#EA580C] uppercase tracking-wider">Sep</span>
                    <span className="text-4xl font-black text-gray-900 leading-none my-1">15</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Sun</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center border-l-2 border-orange-100 pl-4">
                    <h4 className="text-sm font-bold text-gray-900">Ganesh Chaturthi Celebration</h4>
                    <p className="text-[11px] text-gray-500 mt-1 font-medium flex items-center gap-1">
                       Community Hall, Tower A
                    </p>
                    <div className="flex items-center gap-1.5 mt-2.5 text-gray-600 bg-white w-fit px-2 py-1 rounded shadow-sm border border-orange-50">
                      <CalendarRange className="w-3 h-3 text-[#EA580C]" />
                      <span className="text-[10px] font-bold">6:00 PM Onwards</span>
                    </div>
                  </div>
                </div>
                {/* Ganesh Decorative graphic placeholder */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-200/40 rounded-full blur-xl"></div>
                <div className="absolute bottom-2 right-2 text-5xl opacity-80 drop-shadow-lg">🐘</div>
              </div>
            </section>

          </div>
        </div>

        {/* Right Area (Illustration Card) */}
        <div className="xl:col-span-1">
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[300px]">
             {/* Illustration Placeholder */}
             <div className="w-full max-w-[200px] aspect-video bg-[#FFF8F3] rounded-2xl mb-8 flex items-center justify-center border border-orange-100 relative shadow-inner">
                <span className="text-6xl absolute bottom-2">🏙️🌳</span>
             </div>
             
             <h3 className="text-xl font-black text-gray-900 leading-tight mb-3">Together for a<br/>better community</h3>
             <p className="text-sm text-gray-500 font-medium px-4">A cleaner, safer and happier<br/>place to live.</p>
             <div className="w-8 h-1 bg-[#EA580C] rounded-full mt-6"></div>
          </section>
        </div>

      </div>
    </div>
  );
};

export default ResidentDashboard;
