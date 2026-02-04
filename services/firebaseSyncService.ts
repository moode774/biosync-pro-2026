import { db } from './firebaseConfig';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    Timestamp,
    serverTimestamp
} from 'firebase/firestore';
import { Employee, AttendanceRecord } from '../types';

const START_YEAR = 2026;

/**
 * Firebase Sync Service
 * Intelligently syncs data from ZKTeco device to Firebase
 * - Employee-centric structure
 * - 2026+ filtering
 * - Automatic work hours calculation
 */

// Helper: Convert employee name to safe document ID
const nameToDocId = (name: string): string => {
    return name
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '')
        .substring(0, 100);
};

// Helper: Calculate work hours between check-in and check-out
const calculateWorkHours = (checkIn: Date, checkOut: Date): number => {
    const diff = checkOut.getTime() - checkIn.getTime();
    return Math.round((diff / (1000 * 60 * 60)) * 100) / 100; // Hours with 2 decimals
};

// Helper: Determine attendance status
const getAttendanceStatus = (checkIn: Date): 'present' | 'late' | 'absent' => {
    const hour = checkIn.getHours();
    const minute = checkIn.getMinutes();

    // Late if after 8:30 AM
    if (hour > 8 || (hour === 8 && minute > 30)) {
        return 'late';
    }
    return 'present';
};

// Map device user ID to employee name
const deviceIdToNameMap = new Map<string, string>();

export const firebaseSyncService = {
    /**
     * Sync employees to Firebase
     * Creates employee profiles with device ID mapping
     */
    syncEmployeesToFirebase: async (employees: Employee[]): Promise<void> => {
        console.log(`🔄 Syncing ${employees.length} employees to Firebase...`);

        for (const emp of employees) {
            const docId = nameToDocId(emp.name);

            // Store mapping for later use
            deviceIdToNameMap.set(emp.id, emp.name);

            const employeeRef = doc(db, 'employees', docId);

            await setDoc(employeeRef, {
                profile: {
                    fullName: emp.name,
                    deviceUserId: emp.id,
                    department: emp.department || 'Not Specified',
                    position: emp.position || 'Staff',
                    joinDate: Timestamp.now(),
                    lastSyncedAt: serverTimestamp()
                }
            }, { merge: true });

            console.log(`✅ Synced employee: ${emp.name}`);
        }

        console.log(`✨ Successfully synced ${employees.length} employees`);
    },

    /**
     * Sync attendance records to Firebase
     * - Filters 2026+ only
     * - Groups by employee and month
     * - Calculates work hours automatically
     */
    syncAttendanceToFirebase: async (records: AttendanceRecord[]): Promise<void> => {
        console.log(`🔄 Processing ${records.length} attendance records...`);

        // Filter 2026+ only
        const filtered2026 = records.filter(r => {
            const year = new Date(r.timestamp).getFullYear();
            return year >= START_YEAR;
        });

        console.log(`📅 Filtered to ${filtered2026.length} records from ${START_YEAR}+`);

        // Group by employee and date
        const groupedByEmployee = new Map<string, Map<string, { checkIn?: Date, checkOut?: Date, records: AttendanceRecord[] }>>();

        for (const record of filtered2026) {
            const employeeName = deviceIdToNameMap.get(record.employeeId) || `Unknown_${record.employeeId}`;
            const date = new Date(record.timestamp);
            const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

            if (!groupedByEmployee.has(employeeName)) {
                groupedByEmployee.set(employeeName, new Map());
            }

            const employeeRecords = groupedByEmployee.get(employeeName)!;
            if (!employeeRecords.has(dateKey)) {
                employeeRecords.set(dateKey, { records: [] });
            }

            const dayRecord = employeeRecords.get(dateKey)!;
            dayRecord.records.push(record);

            if (record.type === 'check-in') {
                dayRecord.checkIn = date;
            } else if (record.type === 'check-out') {
                dayRecord.checkOut = date;
            }
        }

        // Sync to Firebase
        let syncedCount = 0;

        for (const [employeeName, dateRecords] of groupedByEmployee) {
            const docId = nameToDocId(employeeName);

            for (const [dateKey, dayData] of dateRecords) {
                if (!dayData.checkIn) continue; // Skip if no check-in

                const yearMonth = dateKey.substring(0, 7); // YYYY-MM
                const recordId = `${dateKey}_${dayData.checkIn.getTime()}`;

                const attendanceRef = doc(
                    db,
                    'employees',
                    docId,
                    'attendance',
                    yearMonth,
                    'records',
                    recordId
                );

                // Check for duplicates
                const existing = await getDoc(attendanceRef);
                if (existing.exists()) {
                    console.log(`⏭️  Skipping duplicate: ${employeeName} on ${dateKey}`);
                    continue;
                }

                const workHours = dayData.checkOut
                    ? calculateWorkHours(dayData.checkIn, dayData.checkOut)
                    : 0;

                await setDoc(attendanceRef, {
                    date: Timestamp.fromDate(dayData.checkIn),
                    checkIn: Timestamp.fromDate(dayData.checkIn),
                    checkOut: dayData.checkOut ? Timestamp.fromDate(dayData.checkOut) : null,
                    workHours,
                    status: getAttendanceStatus(dayData.checkIn),
                    deviceId: dayData.records[0].deviceId,
                    syncedAt: serverTimestamp()
                });

                syncedCount++;
                console.log(`✅ Synced: ${employeeName} - ${dateKey} (${workHours}h)`);
            }
        }

        // Update sync metadata
        await setDoc(doc(db, 'sync-metadata', 'last-sync'), {
            timestamp: serverTimestamp(),
            recordsCount: syncedCount,
            year: START_YEAR
        });

        console.log(`✨ Successfully synced ${syncedCount} attendance records`);
    },

    /**
     * Get last sync timestamp
     */
    getLastSyncTimestamp: async (): Promise<Date | null> => {
        const metadataRef = doc(db, 'sync-metadata', 'last-sync');
        const snapshot = await getDoc(metadataRef);

        if (snapshot.exists()) {
            const data = snapshot.data();
            return data.timestamp?.toDate() || null;
        }

        return null;
    }
};
