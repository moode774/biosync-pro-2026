# -*- coding: utf-8 -*-
"""
اختبار Firebase - بيانات تجريبية
=====================================
"""

from datetime import datetime, timedelta
import firebase_admin
from firebase_admin import credentials, firestore
import sys
import random

# Fix encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Firebase
FIREBASE_KEY_PATH = 'fingr-607a9-firebase-adminsdk-fbsvc-9844f0a730.json'

print("="*60)
print("Testing Firebase Connection with Demo Data")
print("="*60)

# Initialize Firebase
print("\n1. Initializing Firebase...")
if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_KEY_PATH)
    firebase_admin.initialize_app(cred)

db = firestore.client()
print("   Firebase connected!\n")

# Demo employees
demo_employees = [
    {'id': '1', 'name': 'أحمد علي محمد', 'department': 'الهندسة', 'position': 'مهندس'},
    {'id': '2', 'name': 'سارة محمد حسن', 'department': 'الموارد البشرية', 'position': 'مدير موارد بشرية'},
    {'id': '3', 'name': 'عمر حسن أحمد', 'department': 'المبيعات', 'position': 'مندوب مبيعات'},
    {'id': '4', 'name': 'فاطمة خالد', 'department': 'المحاسبة', 'position': 'محاسب'},
    {'id': '5', 'name': 'محمد عبدالله', 'department': 'تقنية المعلومات', 'position': 'مبرمج'}
]

print("2. Saving demo employees to Firebase...")
for emp in demo_employees:
    emp_doc_id = f"emp_{emp['id']}"
    emp_ref = db.collection('employees').document(emp_doc_id)
    
    emp_ref.set({
        'profile': {
            'fullName': emp['name'],
            'userId': emp['id'],
            'department': emp['department'],
            'position': emp['position'],
            'lastSyncedAt': firestore.SERVER_TIMESTAMP
        }
    }, merge=True)
    
    print(f"   Saved: {emp['name']}")

print("\n3. Generating demo attendance records...")

total_records = 0
start_date = datetime(2026, 2, 1)

for emp in demo_employees:
    emp_doc_id = f"emp_{emp['id']}"
    emp_ref = db.collection('employees').document(emp_doc_id)
    
    # Generate records for February 2026
    for day in range(1, 5):  # First 4 days of February
        date = start_date + timedelta(days=day-1)
        
        # Skip weekends
        if date.weekday() >= 5:
            continue
        
        month_key = date.strftime('%Y-%m')
        month_ref = emp_ref.collection('attendance').document(month_key)
        
        # Check-in (7:00-8:30 AM)
        checkin_time = date.replace(hour=7+random.randint(0,1), minute=random.randint(0,59))
        checkin_id = f"{checkin_time.strftime('%Y%m%d_%H%M%S')}_check-in"
        
        month_ref.collection('records').document(checkin_id).set({
            'timestamp': checkin_time,
            'type': 'check-in',
            'statusCode': 0,
            'punch': 0,
            'date': checkin_time.strftime('%Y-%m-%d'),
            'time': checkin_time.strftime('%H:%M:%S'),
            'deviceId': 'uFace800-Main',
            'syncedAt': firestore.SERVER_TIMESTAMP
        })
        
        # Check-out (4:00-6:00 PM)
        checkout_time = date.replace(hour=16+random.randint(0,2), minute=random.randint(0,59))
        checkout_id = f"{checkout_time.strftime('%Y%m%d_%H%M%S')}_check-out"
        
        month_ref.collection('records').document(checkout_id).set({
            'timestamp': checkout_time,
            'type': 'check-out',
            'statusCode': 1,
            'punch': 1,
            'date': checkout_time.strftime('%Y-%m-%d'),
            'time': checkout_time.strftime('%H:%M:%S'),
            'deviceId': 'uFace800-Main',
            'syncedAt': firestore.SERVER_TIMESTAMP
        })
        
        total_records += 2
    
    print(f"   Generated records for: {emp['name']}")

# Save sync metadata
print("\n4. Saving sync metadata...")
sync_meta_ref = db.collection('sync-metadata').document('last-sync')
sync_meta_ref.set({
    'timestamp': firestore.SERVER_TIMESTAMP,
    'totalEmployees': len(demo_employees),
    'totalRecords': total_records,
    'startDate': start_date,
    'mode': 'DEMO_DATA'
})

print("\n" + "="*60)
print("SUCCESS!")
print("="*60)
print(f"Total Employees: {len(demo_employees)}")
print(f"Total Records: {total_records}")
print("="*60)
print("\nNow open your React app and click 'Sync Now'!")
print("The data should appear immediately!\n")
