"""
🔒 PROFESSIONAL READ-ONLY ZKTeco Device Proxy Server
===================================================

⚠️ CRITICAL SAFETY GUARANTEE:
This server uses the ZK Protocol (Port 4370) for professional reliability.
It is STRICTLY READ-ONLY. It will NEVER modify, delete, or update device data.

Intelligence:
✅ Maps Fingerprint IDs to Actual Names
✅ Filters only 2026+ records
✅ Deduplicates records to prevent "19,000 logs" redundancy
✅ Fast & Reliable protocol connection
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from zk import ZK, const
from datetime import datetime
import time
import os

app = Flask(__name__)
CORS(app)

# Configuration
DEVICE_IP = os.environ.get('VITE_DEVICE_IP', '10.10.1.127')
DEVICE_PORT = 4370
START_YEAR = 2026

class ProfessionalZKReader:
    def __init__(self, ip, port=4370):
        self.ip = ip
        self.port = port
        self.zk = ZK(ip, port=port, timeout=10, force_udp=False)
        self.conn = None

    def connect(self):
        try:
            if not self.conn:
                print(f"🔗 [READ-ONLY] Connecting to ZK device at {self.ip}:{self.port}...")
                self.conn = self.zk.connect()
                print("✅ Connected successfully!")
            return True
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            return False

    def disconnect(self):
        if self.conn:
            try:
                self.conn.disconnect()
                print("🔌 Disconnected from device")
            except:
                pass
            self.conn = None

    def get_intelligent_data(self):
        """
        Reads users and logs, then combines them intelligently.
        """
        if not self.connect():
            return None, None

        try:
            # 1. Fetch Users to build Name Map (ID -> Name)
            print("👥 Fetching user profiles for name mapping...")
            users = self.conn.get_users()
            user_map = {u.user_id: u.name for u in users}
            
            # Format employees for frontend
            formatted_employees = []
            for u in users:
                formatted_employees.append({
                    'id': str(u.user_id),  # Convert to string for consistency
                    'name': u.name if u.name else f"User {u.user_id}",
                    'department': 'Not Specified', # Device doesn't always store department in basic user object
                    'position': 'Staff'
                })


            # 2. Fetch Attendance Logs
            print("📊 Fetching attendance logs (Read-Only)...")
            attendance = self.conn.get_attendance()
            print(f"✅ Retrieved {len(attendance)} total logs from device")

            # 3. Intelligent Filtering (2026+ and Deduplication)
            print(f"📅 Filtering for year {START_YEAR}+ and organizing...")
            
            processed_logs = []
            seen_records = set() # To avoid duplicates in the same sync

            for log in attendance:
                # Year Filter
                if log.timestamp.year < START_YEAR:
                    continue

                # Unique ID for deduplication: user_id + timestamp
                record_id = f"{log.user_id}_{log.timestamp.strftime('%Y%m%d%H%M%S')}"
                
                if record_id in seen_records:
                    continue
                seen_records.add(record_id)

                # Map ID to Name
                user_name = user_map.get(log.user_id, f"User {log.user_id}")
                
                # Convert punch code to type
                # punch == 0 or 1 typically means check-in, 2 or 3 means check-out
                # This varies by device, but we'll use a common mapping
                record_type = 'check-in' if log.punch in [0, 1] else 'check-out'

                processed_logs.append({
                    'id': record_id,
                    'employeeId': str(log.user_id),  # Convert to string for consistency
                    'employeeName': user_name,
                    'timestamp': log.timestamp.isoformat(),
                    'type': record_type,  # Frontend expects 'type' field
                    'deviceId': 'uFace800-Main'
                })

            print(f"✨ Intelligent processing complete. {len(processed_logs)} records ready.")
            return formatted_employees, processed_logs


        except Exception as e:
            print(f"❌ Error during data retrieval: {e}")
            return None, None
        finally:
            self.disconnect()

reader = ProfessionalZKReader(DEVICE_IP, DEVICE_PORT)

@app.route('/api/sync', methods=['GET'])
def sync_device():
    """
    Sync endpoint - Uses ZK Protocol for real data
    """
    try:
        print("\n🚀 [PROFESSIONAL SYNC] Starting real-time data retrieval...")
        print("⚠️  SAFETY GUARANTEE: Device data will NOT be modified\n")
        
        employees, records = reader.get_intelligent_data()
        
        if employees is None:
            return jsonify({
                'success': False,
                'error': 'Failed to connect to biometric device. Check IP and network.'
            }), 500
        
        return jsonify({
            'success': True,
            'employees': employees,
            'records': records,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"\n❌ Sync error: {e}\n")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'protocol': 'ZK (Port 4370)',
        'mode': 'READ-ONLY',
        'device': DEVICE_IP,
        'safety': 'Device data remains untouched'
    })

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🔒 ZKTeco PROFESSIONAL READ-ONLY PROXY")
    print("="*60)
    print(f"\n📍 Device: {DEVICE_IP}:{DEVICE_PORT}")
    print(f"📅 Year Filter: {START_YEAR}+")
    print(f"\n⚠️  SAFETY MODE: ZK Protocol (Read-Only)")
    print(f"\n🌐 Starting server on http://localhost:5000")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=False)
