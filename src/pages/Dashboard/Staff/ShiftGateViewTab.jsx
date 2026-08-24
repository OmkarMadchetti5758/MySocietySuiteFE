import React, { useState } from 'react';
import { Sun, Cloud, Moon, Clock } from 'lucide-react';

const ShiftGateViewTab = ({ staffData }) => {
  const [groupBy, setGroupBy] = useState('shift');

  const getInitials = (name) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Pre-defined shift categories based on the HTML
  const shiftCategories = [
    { id: 'Morning', title: 'Morning', time: '6:00 – 14:00', icon: Sun, colorClass: 'bg-amber-50 text-amber-500' },
    { id: 'Afternoon', title: 'Afternoon', time: '14:00 – 22:00', icon: Cloud, colorClass: 'bg-blue-50 text-blue-500' },
    { id: 'Night', title: 'Night', time: '22:00 – 6:00', icon: Moon, colorClass: 'bg-indigo-50 text-indigo-600' },
    { id: 'Other', title: 'Other Shifts', time: 'Custom', icon: Clock, colorClass: 'bg-gray-100 text-gray-500' }
  ];

  const groupedByShift = () => {
    const groups = { Morning: [], Afternoon: [], Night: [], Other: [] };
    staffData.forEach(staff => {
      let matched = false;
      for (const cat of ['Morning', 'Afternoon', 'Night']) {
        if ((staff.shift || '').includes(cat)) {
          groups[cat].push(staff);
          matched = true;
          break;
        }
      }
      if (!matched) groups.Other.push(staff);
    });
    return groups;
  };

  const shiftGroups = groupedByShift();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-white">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Staff assigned per shift and gate</h2>
          <p className="text-xs text-gray-500 mt-1">Live view — who is deployed where, right now</p>
        </div>
        <div>
          <select 
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="shift">Group by shift</option>
            {/* Grouping by gate logic could be added here, for now it only groups by shift visually */}
          </select>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {shiftCategories.map(cat => {
          const members = shiftGroups[cat.id];
          if (members.length === 0 && cat.id === 'Other') return null; // Hide empty Other

          const Icon = cat.icon;
          return (
            <div key={cat.id} className="border border-gray-200 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/30">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{cat.title}</div>
                    <div className="text-xs text-gray-500">{cat.time}</div>
                  </div>
                </div>
                <div className="text-xs font-bold text-gray-400 bg-white border border-gray-200 px-2 py-1 rounded-lg">
                  {members.length}
                </div>
              </div>
              <div className="p-2 space-y-1">
                {members.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400">No staff assigned</div>
                ) : (
                  members.map(staff => (
                    <div key={staff._id} className="flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xs font-bold">
                          {getInitials(staff.name)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{staff.name}</div>
                          <div className="text-[10px] text-gray-500 capitalize">{staff.role?.replace(/_/g, ' ')}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                        {staff.gateOrArea || 'N/A'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShiftGateViewTab;
