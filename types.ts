export type Language = 'en' | 'ar';

export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  avatarUrl: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  timestamp: string; // ISO String
  type: 'check-in' | 'check-out';
  deviceId: string;
}

export interface AppSettings {
  deviceIp: string;
  syncInterval: number; // in minutes
  lastSync: string | null;
  firebaseConnected: boolean;
}

// Stats interface for the dashboard
export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  lateArrivals: number;
  absent: number;
}
