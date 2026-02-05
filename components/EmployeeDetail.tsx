import React, { useState, useMemo } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, TrendingUp, Award, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { Employee, AttendanceRecord, DailyAttendance, AttendanceStats } from '../types';

interface EmployeeDetailProps {
  employee: Employee;
  records: AttendanceRecord[];
  onBack: () => void;
}

export const EmployeeDetail: React.FC<EmployeeDetailProps> = ({ employee, records, onBack }) => {
  const { t, dir } = useLanguage();
  
  // Date filter state
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>('2026-12-31');

  // Filter records for this employee
  const empRecords = useMemo(() => {
    return records
      .filter(r => r.employeeId === employee.id)
      .filter(r => {
        const recordDate = new Date(r.timestamp);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return recordDate >= start && recordDate <= end;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [records, employee.id, startDate, endDate]);

  // Group records by day
  const dailyAttendance = useMemo(() => {
    const grouped = new Map<string, DailyAttendance>();
    
    empRecords.forEach(record => {
      const date = new Date(record.timestamp).toISOString().split('T')[0];
      
      if (!grouped.has(date)) {
        grouped.set(date, {
          date,
          status: 'absent'
        });
      }
      
      const day = grouped.get(date)!;
      
      if (record.type === 'check-in') {
        day.checkIn = record;
        // Check if late (after 8:00 AM)
        const checkInTime = new Date(record.timestamp);
        const isLate = checkInTime.getHours() > 8 || (checkInTime.getHours() === 8 && checkInTime.getMinutes() > 0);
        day.status = isLate ? 'late' : 'present';
      } else {
        day.checkOut = record;
      }
      
      // Calculate hours worked
      if (day.checkIn && day.checkOut) {
        const checkInTime = new Date(day.checkIn.timestamp).getTime();
        const checkOutTime = new Date(day.checkOut.timestamp).getTime();
        day.hoursWorked = (checkOutTime - checkInTime) / (1000 * 60 * 60);
      }
    });
    
    return Array.from(grouped.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [empRecords]);

  // Calculate statistics
  const stats = useMemo((): AttendanceStats => {
    const presentDays = dailyAttendance.filter(d => d.status === 'present').length;
    const lateDays = dailyAttendance.filter(d => d.status === 'late').length;
    const totalHours = dailyAttendance.reduce((sum, d) => sum + (d.hoursWorked || 0), 0);
    
    return {
      totalDays: dailyAttendance.length,
      presentDays,
      lateDays,
      absentDays: 0, // We only show days with records
      totalHours,
      averageHours: dailyAttendance.length > 0 ? totalHours / dailyAttendance.length : 0
    };
  }, [dailyAttendance]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(dir === 'rtl' ? 'ar-SA' : 'en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <button 
        onClick={onBack}
        className="flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-4 group"
      >
        <ArrowLeft className={`${dir === 'rtl' ? 'rotate-180 ml-2' : 'mr-2'} group-hover:scale-110 transition-transform`} size={20} />
        <span className="font-medium">Back to List</span>
      </button>

      {/* Employee Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-32 h-32 rounded-full overflow-hidden shadow-2xl border-4 border-white/30 backdrop-blur-sm">
            <img src={employee.avatarUrl} alt={employee.name} className="w-full h-full object-cover" />
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-bold mb-3">{employee.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full font-medium">
                ID: {employee.id}
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full font-medium">
                {employee.department}
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full font-medium">
                {employee.position}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-white/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="text-blue-600" size={20} />
          <h3 className="font-bold text-lg text-gray-900">Filter by Date</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle size={24} />
            <span className="text-3xl font-bold">{stats.presentDays}</span>
          </div>
          <p className="text-sm font-medium opacity-90">Present Days</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle size={24} />
            <span className="text-3xl font-bold">{stats.lateDays}</span>
          </div>
          <p className="text-sm font-medium opacity-90">Late Arrivals</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Clock size={24} />
            <span className="text-3xl font-bold">{stats.totalHours.toFixed(0)}</span>
          </div>
          <p className="text-sm font-medium opacity-90">Total Hours</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={24} />
            <span className="text-3xl font-bold">{stats.averageHours.toFixed(1)}</span>
          </div>
          <p className="text-sm font-medium opacity-90">Avg Hours/Day</p>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-white/50 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <Award className="text-blue-600" size={20} />
            Attendance Records ({dailyAttendance.length} days)
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dailyAttendance.map((day) => (
                <tr key={day.date} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="font-medium text-gray-900">{formatDate(day.date)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {day.checkIn ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-gray-700 font-medium">{formatTime(day.checkIn.timestamp)}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {day.checkOut ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <span className="text-gray-700 font-medium">{formatTime(day.checkOut.timestamp)}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {day.hoursWorked ? (
                      <span className="font-semibold text-gray-900">{day.hoursWorked.toFixed(1)}h</span>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      day.status === 'present' 
                        ? 'bg-green-100 text-green-700' 
                        : day.status === 'late'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {day.status === 'present' && <CheckCircle size={12} />}
                      {day.status === 'late' && <AlertCircle size={12} />}
                      {day.status === 'present' ? 'On Time' : day.status === 'late' ? 'Late' : 'Absent'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {dailyAttendance.length === 0 && (
            <div className="p-12 text-center">
              <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-400 text-lg">No attendance records found for the selected date range.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};