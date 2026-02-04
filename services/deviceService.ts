import { AttendanceRecord, Employee } from '../types';
import { firebaseSyncService } from './firebaseSyncService';

/**
 * ⚠️ CRITICAL SAFETY NOTE - READ-ONLY OPERATION ⚠️
 * 
 * This service is STRICTLY READ-ONLY. It ONLY reads data from the device.
 * 
 * ✅ ALLOWED OPERATIONS:
 *    - Reading employee list
 *    - Reading attendance records
 *    - Filtering data by year (2026+)
 * 
 * ❌ FORBIDDEN OPERATIONS (NOT IMPLEMENTED):
 *    - Deleting employees or records
 *    - Modifying employee information
 *    - Updating attendance data
 *    - Writing any data back to device
 *    - Changing device settings
 * 
 * The device data remains 100% UNTOUCHED and SAFE.
 * All modifications happen ONLY in Firebase, never on the device.
 */

const START_YEAR_FILTER = 2026;

interface DeviceCredentials {
  ip: string;
  username: string;
  password: string;
}

// Get credentials from environment
const getCredentials = (): DeviceCredentials => ({
  ip: import.meta.env.VITE_DEVICE_IP || '10.10.1.127',
  username: import.meta.env.VITE_DEVICE_USERNAME || 'admin',
  password: import.meta.env.VITE_DEVICE_PASSWORD || ''
});

/**
 * Parse HTML table from device web interface
 * This is a simplified parser - real implementation would use cheerio or similar
 */
const parseDeviceHTML = (html: string, type: 'users' | 'attendance'): any[] => {
  // For now, return mock data structure
  // In production, this would parse actual HTML tables from the device
  console.warn('⚠️ HTML parsing not yet implemented - using mock data');
  return [];
};

/**
 * Authenticate with device (READ-ONLY)
 * 
 * ⚠️ SAFETY: This ONLY authenticates to READ data.
 * No write permissions are requested or used.
 */
const authenticateDevice = async (credentials: DeviceCredentials): Promise<string | null> => {
  try {
    console.log(`🔐 [READ-ONLY] Authenticating with device at ${credentials.ip}...`);
    console.log(`⚠️  SAFETY MODE: Read-only access - device data will NOT be modified`);

    // Note: This is a browser-based app, so direct HTTP requests to the device
    // may be blocked by CORS. In production, you'd need either:
    // 1. A backend proxy server
    // 2. CORS configuration on the device
    // 3. A browser extension to bypass CORS

    const response = await fetch(`http://${credentials.ip}/csl/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `username=${encodeURIComponent(credentials.username)}&userpwd=${encodeURIComponent(credentials.password)}`,
      mode: 'no-cors' // This will limit what we can read from the response
    });

    console.log('✅ Authentication request sent');
    return 'session-token'; // In real implementation, extract session cookie

  } catch (error) {
    console.error('❌ Authentication failed:', error);
    return null;
  }
};

/**
 * Fetch employees from device (READ-ONLY)
 * 
 * ⚠️ SAFETY: This function ONLY reads the employee list.
 * It does NOT modify, delete, or update any employee data on the device.
 */
const fetchEmployeesFromDevice = async (sessionToken: string, ip: string): Promise<Employee[]> => {
  console.log('👥 Fetching employees from device...');

  // Mock data for now - in production, scrape from device user management page
  const mockEmployees: Employee[] = [
    { id: '1', name: 'Ahmed Ali', department: 'Engineering', position: 'Engineer', avatarUrl: 'https://picsum.photos/seed/1/200' },
    { id: '2', name: 'Sara Mohammed', department: 'HR', position: 'HR Manager', avatarUrl: 'https://picsum.photos/seed/2/200' },
    { id: '3', name: 'Omar Hassan', department: 'Sales', position: 'Sales Rep', avatarUrl: 'https://picsum.photos/seed/3/200' },
  ];

  return mockEmployees;
};

/**
 * Fetch attendance records from device (READ-ONLY)
 * 
 * ⚠️ SAFETY: This function ONLY reads attendance logs.
 * It does NOT modify, delete, or update any attendance data on the device.
 */
const fetchAttendanceFromDevice = async (sessionToken: string, ip: string): Promise<AttendanceRecord[]> => {
  console.log('📊 Fetching attendance records from device...');

  // Mock data for now - in production, scrape from device attendance log page
  const records: AttendanceRecord[] = [];
  const baseDate = new Date(`${START_YEAR_FILTER}-01-01T08:00:00`);

  // Generate some 2026 records
  for (let empId = 1; empId <= 3; empId++) {
    for (let day = 0; day < 30; day++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + day);

      if (Math.random() > 0.1) {
        // Check in
        const checkIn = new Date(date);
        checkIn.setHours(7 + Math.floor(Math.random() * 2));
        checkIn.setMinutes(Math.floor(Math.random() * 60));

        records.push({
          id: `REC-${empId}-${day}-IN`,
          employeeId: String(empId),
          timestamp: checkIn.toISOString(),
          type: 'check-in',
          deviceId: 'uFace800-Main'
        });

        // Check out
        const checkOut = new Date(date);
        checkOut.setHours(16 + Math.floor(Math.random() * 2));
        checkOut.setMinutes(Math.floor(Math.random() * 60));

        records.push({
          id: `REC-${empId}-${day}-OUT`,
          employeeId: String(empId),
          timestamp: checkOut.toISOString(),
          type: 'check-out',
          deviceId: 'uFace800-Main'
        });
      }
    }
  }

  return records;
};

export const deviceService = {
  /**
   * Sync with device and upload to Firebase
   * 
   * ⚠️ CRITICAL SAFETY GUARANTEE:
   * This function is 100% READ-ONLY. It will:
   * ✅ Call backend proxy to read employee data
   * ✅ Call backend proxy to read attendance records
   * ✅ Filter data (2026+ only)
   * ✅ Upload filtered data to Firebase
   * 
   * ❌ It will NEVER:
   * ❌ Delete any data from device
   * ❌ Modify any data on device
   * ❌ Update any device settings
   * ❌ Write anything back to device
   * 
   * The device remains completely UNTOUCHED and SAFE.
   */
  syncWithDevice: async (ipAddress: string): Promise<{ employees: Employee[], records: AttendanceRecord[] }> => {
    console.log(`🚀 [READ-ONLY MODE] Starting safe sync via backend proxy...`);
    console.log(`⚠️  SAFETY GUARANTEE: Device data will NOT be modified, deleted, or updated`);

    try {
      // Call Python backend proxy (runs on localhost:5000)
      const PROXY_URL = 'http://localhost:5000/api/sync';

      console.log('📡 Connecting to backend proxy...');
      const response = await fetch(PROXY_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Backend proxy error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Sync failed');
      }

      const employees: Employee[] = data.employees.map((emp: any) => ({
        id: emp.id,
        name: emp.name,
        department: emp.department || 'Not Specified',
        position: emp.position || 'Staff',
        avatarUrl: `https://picsum.photos/seed/${emp.id}/200`
      }));

      const records: AttendanceRecord[] = data.records;

      console.log(`✅ Received ${employees.length} employees from backend`);
      console.log(`✅ Received ${records.length} attendance records from backend`);

      // Filter 2026+ (backend already does this, but double-check for safety)
      const filteredRecords = records.filter(r => {
        const year = new Date(r.timestamp).getFullYear();
        return year >= START_YEAR_FILTER;
      });

      console.log(`📅 Confirmed ${filteredRecords.length} records from ${START_YEAR_FILTER}+`);

      // Sync to Firebase
      console.log('☁️ Syncing to Firebase...');
      await firebaseSyncService.syncEmployeesToFirebase(employees);
      await firebaseSyncService.syncAttendanceToFirebase(filteredRecords);

      console.log('✨ Sync completed successfully!');

      return {
        employees,
        records: filteredRecords
      };

    } catch (error) {
      console.error('❌ Sync failed:', error);

      // Check if backend is running
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('\n⚠️  Backend proxy is not running!');
        console.error('📝 Please start the backend server:');
        console.error('   cd backend');
        console.error('   python proxy_server.py\n');
      }

      throw error;
    }
  }
};