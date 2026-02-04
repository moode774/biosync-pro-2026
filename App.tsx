import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings as SettingsIcon, RefreshCw, Fingerprint } from 'lucide-react';
import { LanguageProvider, useLanguage } from './components/LanguageContext';
import { Dashboard } from './components/Dashboard';
import { EmployeeList } from './components/EmployeeList';
import { EmployeeDetail } from './components/EmployeeDetail';
import { Settings } from './components/Settings';
import { deviceService } from './services/deviceService';
import { AppSettings, Employee, AttendanceRecord, DashboardStats } from './types';

// Initial Mock Data
const DEFAULT_SETTINGS: AppSettings = {
  deviceIp: '10.10.1.127',
  syncInterval: 60,
  lastSync: null,
  firebaseConnected: true,
};

const NavigationLink = ({ to, icon: Icon, label }: any) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const { dir } = useLanguage();
  
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
        isActive 
          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
          : 'text-gray-500 hover:bg-white hover:text-gray-900'
      }`}
    >
      <Icon size={20} className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
      <span className="font-medium">{label}</span>
      {isActive && <div className={`w-1 h-1 rounded-full bg-white absolute ${dir === 'rtl' ? 'left-4' : 'right-4'}`} />}
    </Link>
  );
};

const MainLayout = () => {
  const { t, dir } = useLanguage();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Stats calculation
  const stats: DashboardStats = {
    totalEmployees: employees.length,
    presentToday: Math.floor(employees.length * 0.8), // Mock logic for demo
    lateArrivals: Math.floor(employees.length * 0.1),
    absent: Math.floor(employees.length * 0.1),
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const data = await deviceService.syncWithDevice(settings.deviceIp);
      setEmployees(data.employees);
      setRecords(data.records);
      setSettings(prev => ({ ...prev, lastSync: new Date().toISOString() }));
    } catch (error) {
      console.error("Sync failed", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Initial Sync on load
  useEffect(() => {
    handleSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen bg-[#F5F5F7] overflow-hidden selection:bg-blue-100">
      {/* Sidebar */}
      <aside className={`w-20 lg:w-72 bg-[#F5F5F7] border-r border-gray-200/50 flex flex-col p-4 z-20 hidden md:flex ${dir === 'rtl' ? 'border-l border-r-0' : 'border-r'}`}>
        <div className="flex items-center gap-3 px-4 py-6 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg flex items-center justify-center text-white">
            <Fingerprint size={24} />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-lg font-bold text-gray-900 leading-tight">BioSync</h1>
            <p className="text-xs text-gray-500">Pro 2026</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <NavigationLink to="/" icon={LayoutDashboard} label={t('dashboard')} />
          <NavigationLink to="/employees" icon={Users} label={t('employees')} />
          <NavigationLink to="/settings" icon={SettingsIcon} label={t('settings')} />
        </nav>

        <div className="p-4 bg-white/50 rounded-3xl border border-gray-100 mt-auto hidden lg:block">
          <p className="text-xs text-gray-400 mb-2 font-medium">{t('device_status')}</p>
          <div className="flex items-center gap-2 mb-3">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-sm font-semibold text-gray-700">{t('connected')}</span>
          </div>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? t('syncing') : t('sync_now')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative h-full">
        {/* Mobile Header */}
        <div className="md:hidden p-4 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100">
          <div className="font-bold flex items-center gap-2">
             <Fingerprint className="text-blue-600" size={24}/>
             BioSync Pro
          </div>
          <button onClick={handleSync} className="p-2 bg-gray-100 rounded-full">
             <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto pb-24">
          <Routes>
            <Route path="/" element={<Dashboard stats={stats} data={records} />} />
            <Route path="/employees" element={
              selectedEmployee ? (
                <EmployeeDetail 
                  employee={selectedEmployee} 
                  records={records} 
                  onBack={() => setSelectedEmployee(null)} 
                />
              ) : (
                <EmployeeList 
                  employees={employees} 
                  records={records}
                  onSelectEmployee={setSelectedEmployee} 
                />
              )
            } />
            <Route path="/settings" element={<Settings settings={settings} onUpdateSettings={setSettings} />} />
          </Routes>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around pb-6 z-30">
        <Link to="/" className="p-3 text-gray-500"><LayoutDashboard size={24} /></Link>
        <Link to="/employees" className="p-3 text-gray-500"><Users size={24} /></Link>
        <Link to="/settings" className="p-3 text-gray-500"><SettingsIcon size={24} /></Link>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <HashRouter>
        <MainLayout />
      </HashRouter>
    </LanguageProvider>
  );
}