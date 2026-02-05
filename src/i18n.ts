import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English Translations
const en = {
  common: {
    dashboard: 'Dashboard',
    employees: 'Employees',
    settings: 'Settings',
    sync: 'Sync Device',
    syncNow: 'Sync Now',
    syncing: 'Syncing...',
    search: 'Search...',
    filter: 'Filter',
    export: 'Export',
    lang: 'العربية',
    logOut: 'Log Out',
    welcome: 'Welcome back',
    lastSync: 'Last synced',
    status: {
      active: 'Active',
      inactive: 'Inactive',
      present: 'Present',
      absent: 'Absent',
      late: 'Late',
      early: 'Left Early'
    }
  },
  stats: {
    totalEmployees: 'Total Employees',
    presentToday: 'Present Today',
    lateArrivals: 'Late Arrivals',
    absentToday: 'Absent Today',
    onTime: 'On Time',
    avgWorkHours: 'Avg Work Hours'
  },
  employees: {
    name: 'Name',
    department: 'Department',
    position: 'Position',
    status: 'Status',
    joinDate: 'Join Date',
    actions: 'Actions',
    details: 'Details',
    attendance: 'Attendance',
    profile: 'Profile'
  },
  attendance: {
    date: 'Date',
    checkIn: 'Check In',
    checkOut: 'Check Out',
    workHours: 'Work Hours',
    status: 'Status',
    timeline: 'Timeline',
    calendar: 'Calendar'
  }
};

// Arabic Translations
const ar = {
  common: {
    dashboard: 'لوحة التحكم',
    employees: 'الموظفين',
    settings: 'الإعدادات',
    sync: 'مزامنة الجهاز',
    syncNow: 'مزامنة الآن',
    syncing: 'جاري المزامنة...',
    search: 'بحث...',
    filter: 'تصفية',
    export: 'تصدير',
    lang: 'English',
    logOut: 'تسجيل خروج',
    welcome: 'مرحباً بك',
    lastSync: 'آخر مزامنة',
    status: {
      active: 'نشط',
      inactive: 'غير نشط',
      present: 'حاضر',
      absent: 'غائب',
      late: 'متأخر',
      early: 'انصراف مبكر'
    }
  },
  stats: {
    totalEmployees: 'إجمالي الموظفين',
    presentToday: 'حضور اليوم',
    lateArrivals: 'المتأخرين',
    absentToday: 'الغياب',
    onTime: 'في الوقت المحدد',
    avgWorkHours: 'متوسط ساعات العمل'
  },
  employees: {
    name: 'الاسم',
    department: 'القسم',
    position: 'المسمى الوظيفي',
    status: 'الحالة',
    joinDate: 'تاريخ الانضمام',
    actions: 'إجراءات',
    details: 'التفاصيل',
    attendance: 'سجل الحضور',
    profile: 'الملف الشخصي'
  },
  attendance: {
    date: 'التاريخ',
    checkIn: 'وقت الدخول',
    checkOut: 'وقت الخروج',
    workHours: 'ساعات العمل',
    status: 'الحالة',
    timeline: 'المخطط الزمني',
    calendar: 'التقويم'
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar }
    },
    lng: 'ar', // Default to Arabic
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
