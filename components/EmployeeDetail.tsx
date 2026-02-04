import React from 'react';
import { ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { Employee, AttendanceRecord } from '../types';

interface EmployeeDetailProps {
  employee: Employee;
  records: AttendanceRecord[];
  onBack: () => void;
}

export const EmployeeDetail: React.FC<EmployeeDetailProps> = ({ employee, records, onBack }) => {
  const { t, dir } = useLanguage();

  // Filter records for this employee and sort descending
  const empRecords = records
    .filter(r => r.employeeId === employee.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6 animate-fade-in">
      <button 
        onClick={onBack}
        className="flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-4"
      >
        <ArrowLeft className={`mr-2 ${dir === 'rtl' ? 'rotate-180 ml-2 mr-0' : ''}`} size={20} />
        Back to List
      </button>

      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-white/50 p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg border-4 border-white">
          <img src={employee.avatarUrl} alt={employee.name} className="w-full h-full object-cover" />
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{employee.name}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600">
            <span className="px-3 py-1 bg-gray-100 rounded-full">{employee.id}</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">{employee.department}</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">{employee.position}</span>
          </div>
        </div>
        <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Attendance Score</div>
            <div className="text-4xl font-bold text-green-500">98%</div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-white/50 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-900">{t('attendance_log')} (2026)</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {empRecords.map(record => {
            const date = new Date(record.timestamp);
            return (
              <div key={record.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${record.type === 'check-in' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {record.type === 'check-in' ? t('check_in') : t('check_out')}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Calendar size={12} />
                      {date.toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {date.toLocaleTimeString(dir === 'rtl' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center justify-end gap-1">
                    <MapPin size={10} />
                    {record.deviceId}
                  </div>
                </div>
              </div>
            );
          })}
          {empRecords.length === 0 && (
             <div className="p-8 text-center text-gray-400">No records found for 2026.</div>
          )}
        </div>
      </div>
    </div>
  );
};