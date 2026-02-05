import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Fingerprint, 
  Globe, 
  LogOut,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export const Sidebar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const isRtl = i18n.dir() === 'rtl';

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en');
  };

  const navItems = [
    { icon: LayoutDashboard, label: t('common.dashboard'), path: '/' },
    { icon: Users, label: t('common.employees'), path: '/employees' },
    { icon: Settings, label: t('common.settings'), path: '/settings' },
  ];

  return (
    <aside className="w-20 md:w-72 bg-card border-r border-border flex flex-col h-full shadow-xl shadow-slate-200/50 z-50">
      {/* Brand */}
      <div className="p-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
          <Fingerprint size={28} strokeWidth={1.5} />
        </div>
        <div className="hidden md:block">
          <h1 className="text-xl font-bold tracking-tight text-foreground">BioSync</h1>
          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success inline-block animate-pulse" />
            Pro 2026
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group
                ${isActive 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 translate-x-1' 
                  : 'text-muted-foreground hover:bg-slate-50 hover:text-foreground hover:translate-x-1'
                }
              `}
            >
              <item.icon size={22} strokeWidth={1.5} className={isActive ? 'animate-in' : ''} />
              <span className="font-medium hidden md:block">{item.label}</span>
              
              {isActive && (
                <div className={`absolute w-1.5 h-8 bg-primary rounded-full hidden md:block opacity-0 group-hover:opacity-100 transition-opacity ${isRtl ? '-right-5' : '-left-5'}`} />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User */}
      <div className="p-4 border-t border-border bg-slate-50/50 space-y-3">
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-border hover:border-primary/20 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:text-primary transition-colors">
              <Globe size={18} />
            </div>
            <span className="text-sm font-medium text-slate-700 hidden md:block">
              {t('common.lang')}
            </span>
          </div>
          {isRtl ? <ChevronLeft size={16} className="text-slate-400 hidden md:block" /> : <ChevronRight size={16} className="text-slate-400 hidden md:block" />}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 px-4 py-2 hidden md:flex">
          <img 
            src="https://ui-avatars.com/api/?name=Admin&background=0f172a&color=fff" 
            alt="Admin" 
            className="w-9 h-9 rounded-full ring-2 ring-white shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">Administrator</p>
            <p className="text-xs text-slate-500 truncate">admin@biosync.com</p>
          </div>
          <button className="text-slate-400 hover:text-destructive transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};
