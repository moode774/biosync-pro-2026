# -*- coding: utf-8 -*-
"""
مزامنة احترافية من جهاز البصمة إلى Firebase
==============================================
نفس المنطق الذي يعمل في CSV، لكن يحفظ في Firebase
"""

from zk import ZK, const
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
import sys

# Fix encoding for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# ═══════════════════════════════════════════════════════════
# إعدادات الاتصال
# ═══════════════════════════════════════════════════════════

# جهاز البصمة
ZK_IP = '10.10.1.127'
ZK_PORT = 4370

# Firebase
FIREBASE_KEY_PATH = 'fingr-607a9-firebase-adminsdk-fbsvc-9844f0a730.json'

# تاريخ البداية للفلترة (1 ديسمبر 2025)
START_FILTER = datetime(2025, 12, 1)

print("="*70)
print("مزامنة احترافية من جهاز البصمة إلى Firebase")
print("="*70)

# ═══════════════════════════════════════════════════════════
# 1. تهيئة Firebase
# ═══════════════════════════════════════════════════════════

print("\n[1/5] تهيئة Firebase...")
try:
    if not firebase_admin._apps:
        cred = credentials.Certificate(FIREBASE_KEY_PATH)
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("      ✓ تم الاتصال بـ Firebase بنجاح")
except Exception as e:
    print(f"      ✗ خطأ في Firebase: {e}")
    sys.exit(1)

# ═══════════════════════════════════════════════════════════
# 2. الاتصال بجهاز البصمة
# ═══════════════════════════════════════════════════════════

print(f"\n[2/5] الاتصال بجهاز البصمة على {ZK_IP}...")
zk = ZK(ZK_IP, port=ZK_PORT, timeout=15)
conn = None

try:
    conn = zk.connect()
    print("      ✓ تم الاتصال بالجهاز بنجاح")
    
    # ═══════════════════════════════════════════════════════════
    # 3. قراءة أسماء الموظفين
    # ═══════════════════════════════════════════════════════════
    
    print("\n[3/5] قراءة أسماء الموظفين...")
    users = conn.get_users()
    user_map = {user.user_id: user.name for user in users}
    print(f"      ✓ تم قراءة {len(user_map)} موظف")
    
    # ═══════════════════════════════════════════════════════════
    # 4. قراءة سجلات البصمات
    # ═══════════════════════════════════════════════════════════
    
    print("\n[4/5] قراءة سجلات البصمات من الجهاز...")
    attendances = conn.get_attendance()
    
    # ترتيب زمنياً
    attendances.sort(key=lambda x: x.timestamp)
    print(f"      ✓ تم قراءة {len(attendances)} سجل من الجهاز")
    
    # فلترة حسب التاريخ
    filtered_logs = [log for log in attendances if log.timestamp >= START_FILTER]
    print(f"      ✓ تمت فلترة {len(filtered_logs)} سجل من تاريخ {START_FILTER.strftime('%Y-%m-%d')}")
    
    # ═══════════════════════════════════════════════════════════
    # 5. حفظ في Firebase بشكل احترافي
    # ═══════════════════════════════════════════════════════════
    
    print(f"\n[5/5] حفظ البيانات في Firebase...")
    print("      (منظمة حسب الموظف والشهر)\n")
    
    # تنظيم البيانات حسب الموظف
    employees_data = {}
    
    for log in filtered_logs:
        user_id = str(log.user_id)
        user_name = user_map.get(log.user_id, f"Unknown_{user_id}")
        
        if user_id not in employees_data:
            employees_data[user_id] = {
                'name': user_name,
                'records': []
            }
        
        # تحديد نوع الحركة (نفس المنطق في CSV)
        if log.status in [0, 15, 4]:
            record_type = 'check-in'
            status_desc = 'دخول'
        elif log.status in [1, 5]:
            record_type = 'check-out'
            status_desc = 'خروج'
        else:
            record_type = 'unknown'
            status_desc = 'غير محدد'
        
        employees_data[user_id]['records'].append({
            'timestamp': log.timestamp,
            'date': log.timestamp.strftime('%Y-%m-%d'),
            'time': log.timestamp.strftime('%H:%M:%S'),
            'type': record_type,
            'status_code': log.status,
            'status_desc': status_desc
        })
    
    # حفظ كل موظف في Firebase
    total_saved = 0
    
    for user_id, data in employees_data.items():
        employee_name = data['name']
        records = data['records']
        
        # إنشاء معرف آمن للموظف
        safe_name = employee_name.replace(' ', '_').replace('/', '_')
        emp_doc_id = f"emp_{user_id}_{safe_name}"
        
        print(f"      → {employee_name} (ID: {user_id})")
        
        # حفظ معلومات الموظف
        emp_ref = db.collection('employees').document(emp_doc_id)
        emp_ref.set({
            'profile': {
                'fullName': employee_name,
                'userId': user_id,
                'department': 'Not Specified',
                'position': 'Staff',
                'lastSyncedAt': firestore.SERVER_TIMESTAMP
            }
        }, merge=True)
        
        # تنظيم السجلات حسب الشهر
        records_by_month = {}
        for record in records:
            month_key = record['timestamp'].strftime('%Y-%m')
            if month_key not in records_by_month:
                records_by_month[month_key] = []
            records_by_month[month_key].append(record)
        
        # حفظ السجلات
        for month, month_records in records_by_month.items():
            month_ref = emp_ref.collection('attendance').document(month)
            
            for record in month_records:
                # معرف فريد للسجل
                record_id = f"{record['date']}_{record['time'].replace(':', '')}_{record['type']}"
                record_ref = month_ref.collection('records').document(record_id)
                
                record_ref.set({
                    'timestamp': record['timestamp'],
                    'date': record['date'],
                    'time': record['time'],
                    'type': record['type'],
                    'statusCode': record['status_code'],
                    'statusDesc': record['status_desc'],
                    'deviceId': 'uFace800-Main',
                    'syncedAt': firestore.SERVER_TIMESTAMP
                })
                
                total_saved += 1
            
            print(f"        • شهر {month}: {len(month_records)} سجل")
    
    # حفظ معلومات المزامنة
    sync_meta_ref = db.collection('sync-metadata').document('last-sync')
    sync_meta_ref.set({
        'timestamp': firestore.SERVER_TIMESTAMP,
        'totalEmployees': len(employees_data),
        'totalRecords': total_saved,
        'startDate': START_FILTER,
        'deviceIp': ZK_IP,
        'devicePort': ZK_PORT
    })
    
    # ═══════════════════════════════════════════════════════════
    # النتيجة النهائية
    # ═══════════════════════════════════════════════════════════
    
    print("\n" + "="*70)
    print("✓ تمت المزامنة بنجاح!")
    print("="*70)
    print(f"إجمالي الموظفين: {len(employees_data)}")
    print(f"إجمالي السجلات: {total_saved}")
    print(f"من تاريخ: {START_FILTER.strftime('%Y-%m-%d')}")
    print("="*70)
    print("\nالآن افتح تطبيق React واضغط 'Sync Now' لرؤية البيانات!")
    print("="*70 + "\n")

except Exception as e:
    print(f"\n✗ خطأ: {e}")
    import traceback
    traceback.print_exc()

finally:
    if conn:
        print("\nإغلاق الاتصال بالجهاز...")
        conn.enable_device()  # التأكد أن الجهاز يعمل للموظفين
        conn.disconnect()
        print("✓ تم إغلاق الاتصال بأمان")
