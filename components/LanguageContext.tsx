import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const translations: Record<string, Record<Language, string>> = {
  'dashboard': { en: 'Dashboard', ar: 'لوحة التحكم' },
  'employees': { en: 'Employees', ar: 'الموظفين' },
  'settings': { en: 'Settings', ar: 'الإعدادات' },
  'sync_now': { en: 'Sync Device', ar: 'مزامنة الجهاز' },
  'last_sync': { en: 'Last synced', ar: 'آخر تحديث' },
  'total_staff': { en: 'Total Staff', ar: 'إجمالي الموظفين' },
  'present_today': { en: 'Present Today', ar: 'الحضور اليوم' },
  'late_arrival': { en: 'Late Arrival', ar: 'تأخير' },
  'absent': { en: 'Absent', ar: 'غائب' },
  'device_ip': { en: 'Device IP Address', ar: 'عنوان IP للجهاز' },
  'device_status': { en: 'Device Status', ar: 'حالة الجهاز' },
  'firebase_status': { en: 'Firebase Link', ar: 'الربط مع Firebase' },
  'connected': { en: 'Connected', ar: 'متصل' },
  'search': { en: 'Search employees...', ar: 'بحث عن موظف...' },
  'view_profile': { en: 'View Profile', ar: 'عرض الملف' },
  'attendance_log': { en: 'Attendance Log', ar: 'سجل الحضور' },
  'check_in': { en: 'Check In', ar: 'دخول' },
  'check_out': { en: 'Check Out', ar: 'خروج' },
  'monthly_overview': { en: 'Monthly Overview', ar: 'نظرة شهرية' },
  'safe_mode': { en: 'Safety Mode: Read Only', ar: 'الوضع الآمن: قراءة فقط' },
  'syncing': { en: 'Syncing...', ar: 'جاري المزامنة...' },
  'save': { en: 'Save Configuration', ar: 'حفظ الإعدادات' },
  'year_filter_notice': { en: 'System configured to import data from year 2026 onwards only.', ar: 'النظام مهيأ لاستيراد البيانات من عام 2026 وما بعد فقط.' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar'); // Default to Arabic as requested

  const t = (key: string) => translations[key]?.[language] || key;
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      <div dir={dir} className={language === 'ar' ? 'font-arabic' : 'font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};