import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { EmployeeList } from './components/EmployeeList';
import { EmployeeDetail } from './components/EmployeeDetail';
import { Settings } from './components/Settings';
import './src/i18n';

export default function App() {
  const { i18n } = useTranslation();
  
  // Update document direction based on language
  useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <Router>
      <div className="flex h-screen bg-background text-foreground transition-colors duration-300 overflow-hidden">
        {/* Main Sidebar */}
        <Sidebar />
        
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth">
          {/* Ambient Background Glow */}
          <div className="fixed inset-0 pointer-events-none z-0">
             <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] opacity-60 translate-x-1/3 -translate-y-1/3" />
             <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-success/5 rounded-full blur-[100px] opacity-40 -translate-x-1/3 translate-y-1/3" />
          </div>

          <div className="relative z-10 p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/employees" element={<EmployeeList />} />
              <Route path="/employees/:id" element={<EmployeeDetail />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}