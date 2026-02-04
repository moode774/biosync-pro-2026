import React from 'react';
import { Users, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from './LanguageContext';
import { DashboardStats, AttendanceRecord } from '../types';

interface DashboardProps {
  stats: DashboardStats;
  data: AttendanceRecord[];
}

const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
  <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-white/50 flex items-center justify-between transition-transform hover:scale-[1.02]">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
    </div>
    <div className={`p-4 rounded-2xl ${colorClass}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ stats, data }) => {
  const { t } = useLanguage();

  // Process data for the chart (mocking aggregation for the demo)
  const chartData = [
    { name: '1', present: 20 },
    { name: '5', present: 22 },
    { name: '10', present: 18 },
    { name: '15', present: 24 },
    { name: '20', present: 25 },
    { name: '25', present: 23 },
    { name: '30', present: 21 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard')}</h1>
        <p className="text-gray-500 mt-2">{t('year_filter_notice')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('total_staff')} 
          value={stats.totalEmployees} 
          icon={Users} 
          colorClass="bg-blue-500 shadow-lg shadow-blue-500/30" 
        />
        <StatCard 
          title={t('present_today')} 
          value={stats.presentToday} 
          icon={CheckCircle} 
          colorClass="bg-green-500 shadow-lg shadow-green-500/30" 
        />
        <StatCard 
          title={t('late_arrival')} 
          value={stats.lateArrivals} 
          icon={Clock} 
          colorClass="bg-orange-500 shadow-lg shadow-orange-500/30" 
        />
        <StatCard 
          title={t('absent')} 
          value={stats.absent} 
          icon={AlertCircle} 
          colorClass="bg-red-500 shadow-lg shadow-red-500/30" 
        />
      </div>

      <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-white/50 h-96">
        <h3 className="text-lg font-semibold mb-6 text-gray-800">{t('monthly_overview')} (2026)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0071E3" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0071E3" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Area type="monotone" dataKey="present" stroke="#0071E3" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};