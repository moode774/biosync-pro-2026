import React, { useState } from 'react';
import { Search, ChevronRight, User } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { Employee, AttendanceRecord } from '../types';

interface EmployeeListProps {
  employees: Employee[];
  records: AttendanceRecord[];
  onSelectEmployee: (emp: Employee) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ employees, records, onSelectEmployee }) => {
  const { t, dir } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">{t('employees')}</h1>
        <div className="relative">
          <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={20} />
          <input 
            type="text" 
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
          />
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-white/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50">
              <tr>
                <th className={`p-5 text-xs font-semibold tracking-wide text-gray-500 uppercase ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t('employees')}</th>
                <th className={`p-5 text-xs font-semibold tracking-wide text-gray-500 uppercase ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>Department</th>
                <th className={`p-5 text-xs font-semibold tracking-wide text-gray-500 uppercase ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>Status</th>
                <th className="p-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.map(emp => (
                <tr 
                  key={emp.id} 
                  onClick={() => onSelectEmployee(emp)}
                  className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                >
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        <img src={emp.avatarUrl} alt={emp.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{emp.name}</div>
                        <div className="text-xs text-gray-500">{emp.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-gray-600">{emp.department}</td>
                  <td className="p-5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="p-5">
                    <ChevronRight className={`text-gray-300 group-hover:text-blue-500 transition-colors ${dir === 'rtl' ? 'rotate-180' : ''}`} size={20} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredEmployees.length === 0 && (
          <div className="p-10 text-center text-gray-400">
            No employees found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};