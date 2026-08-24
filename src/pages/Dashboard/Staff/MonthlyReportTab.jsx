import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import staffApi from '../../../services/staffApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MonthlyReportTab = ({ staffData }) => {
  const [monthYear, setMonthYear] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`; // YYYY-MM
  });
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [monthYear]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const [year, month] = monthYear.split('-');
      const res = await staffApi.getMonthlyReport(parseInt(month), parseInt(year));
      if (res.data?.status === 'success') {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const reportMap = {};
  reportData.forEach(r => {
    reportMap[r._id] = r;
  });

  const handleExport = () => {
    const doc = new jsPDF();
    
    const dateObj = new Date(monthYear + '-01');
    const monthName = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Header Design
    doc.setFillColor(249, 115, 22); // Orange theme
    doc.rect(0, 0, doc.internal.pageSize.width, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text('My Society Suite', 14, 20);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Monthly Attendance Report: ${monthName}`, 14, 28);

    doc.setTextColor(0, 0, 0); // Reset to black

    const columns = [
      { header: 'Staff Name', dataKey: 'name' },
      { header: 'Designation', dataKey: 'designation' },
      { header: 'Present', dataKey: 'present' },
      { header: 'Absent', dataKey: 'absent' },
      { header: 'On Leave', dataKey: 'leave' },
      { header: 'Attendance %', dataKey: 'percent' },
    ];
    
    const data = staffData.map(staff => {
      const stats = reportMap[staff._id] || { present: 0, absent: 0, leave: 0, total: 0 };
      const totalWorkingDays = stats.present + stats.absent + stats.leave;
      const percent = totalWorkingDays > 0 ? Math.round((stats.present / totalWorkingDays) * 100) : 0;
      
      const designationStr = staff.designation ? staff.designation.replace('_', ' ') : 'N/A';
      
      return {
        name: staff.user?.name || 'N/A',
        designation: designationStr.charAt(0).toUpperCase() + designationStr.slice(1),
        present: stats.present.toString(),
        absent: stats.absent.toString(),
        leave: stats.leave.toString(),
        percent: `${percent}%`
      };
    });
    
    autoTable(doc, {
      startY: 45,
      columns: columns,
      body: data,
      theme: 'grid',
      styles: { 
        fontSize: 10,
        cellPadding: 6,
        lineColor: [237, 237, 237],
        lineWidth: 0.1,
      },
      headStyles: { 
        fillColor: [249, 115, 22],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        present: { halign: 'center' },
        absent: { halign: 'center' },
        leave: { halign: 'center' },
        percent: { halign: 'center', fontStyle: 'bold' }
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      },
      didParseCell: function(data) {
         if(data.section === 'body' && data.column.dataKey === 'percent') {
            const val = parseInt(data.cell.raw);
            if (val < 50) {
              data.cell.styles.textColor = [239, 68, 68]; // red
            } else if (val < 75) {
              data.cell.styles.textColor = [245, 158, 11]; // amber
            } else {
              data.cell.styles.textColor = [34, 197, 94]; // green
            }
         }
      }
    });
    
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Generated on ${new Date().toLocaleString()}`,
        14,
        doc.internal.pageSize.height - 10
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 25,
        doc.internal.pageSize.height - 10
      );
    }
    
    doc.save(`Attendance_Report_${monthName.replace(' ', '_')}.pdf`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-white">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Monthly attendance summary</h2>
          <p className="text-xs text-gray-500 mt-1">Per-staff attendance breakdown for the selected month</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="month"
            value={monthYear}
            onChange={e => setMonthYear(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
          <button 
            onClick={handleExport}
            disabled={staffData.length === 0}
            className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Staff</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Present</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Absent</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">On leave</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Attendance %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : staffData.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">No staff found.</td></tr>
            ) : (
              staffData.map(staff => {
                const stats = reportMap[staff._id] || { present: 0, absent: 0, leave: 0, total: 0 };
                // Calculate percentage based on days marked. Or based on days in month. 
                // Using days marked for now.
                const totalWorkingDays = stats.present + stats.absent + stats.leave;
                const percent = totalWorkingDays > 0 ? Math.round((stats.present / totalWorkingDays) * 100) : 0;
                
                let barColor = 'bg-green-500';
                if (percent < 75) barColor = 'bg-amber-500';
                if (percent < 50) barColor = 'bg-red-500';

                return (
                  <tr key={staff._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {getInitials(staff.user?.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{staff.user?.name}</div>
                          <div className="text-xs text-gray-500 capitalize">{staff.designation?.replace('_', ' ')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-700">{stats.present}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-700">{stats.absent}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-700">{stats.leave}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden shrink-0">
                          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${percent}%` }}></div>
                        </div>
                        <span className="text-sm font-bold text-gray-700">{percent}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyReportTab;
