# -*- coding: utf-8 -*-
"""
مزامنة بسيطة - ملفات JSON
===========================
بدون Firebase، بدون حدود، بدون تكرار
"""

from zk import ZK, const
from datetime import datetime
import json
import os
import sys

# Fix encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# إعدادات
ZK_IP = '10.10.1.127'
ZK_PORT = 4370
START_FILTER = datetime(2025, 12, 1)
DATA_DIR = 'data/employees'

# إنشاء المجلد
os.makedirs(DATA_DIR, exist_ok=True)

print("="*70)
print("مزامنة بسيطة - حفظ في ملفات JSON")
print("="*70)

zk = ZK(ZK_IP, port=ZK_PORT, timeout=15)
conn = None

try:
    print(f"\n[1/4] الاتصال بالجهاز {ZK_IP}...")
    conn = zk.connect()
    print("      ✓ متصل")
    
    print("\n[2/4] قراءة الموظفين...")
    users = conn.get_users()
    user_map = {user.user_id: user.name for user in users}
    print(f"      ✓ {len(user_map)} موظف")
    
    print("\n[3/4] قراءة البصمات...")
    attendances = conn.get_attendance()
    attendances.sort(key=lambda x: x.timestamp)
    filtered = [log for log in attendances if log.timestamp >= START_FILTER]
    print(f"      ✓ {len(filtered)} سجل")
    
    print("\n[4/4] حفظ في ملفات JSON...")
    
    # تنظيم حسب الموظف
    employees_data = {}
    
    for log in filtered:
        user_id = str(log.user_id)
        user_name = user_map.get(log.user_id, f"Unknown_{user_id}")
        
        if user_id not in employees_data:
            employees_data[user_id] = {
                'profile': {
                    'id': user_id,
                    'name': user_name,
                    'department': 'Not Specified',
                    'position': 'Staff'
                },
                'attendance': {}
            }
        
        # تحديد نوع الحركة بناءً على الوقت
        # قبل الساعة 3 عصراً (15:00) = دخول
        # بعد الساعة 3 عصراً = خروج
        if log.timestamp.hour < 15:
            record_type = 'check-in'
        else:
            record_type = 'check-out'
        
        # تنظيم حسب الشهر
        month_key = log.timestamp.strftime('%Y-%m')
        if month_key not in employees_data[user_id]['attendance']:
            employees_data[user_id]['attendance'][month_key] = []
        
        # إضافة السجل
        record = {
            'id': f"{log.timestamp.strftime('%Y%m%d_%H%M%S')}_{record_type}",
            'date': log.timestamp.strftime('%Y-%m-%d'),
            'time': log.timestamp.strftime('%H:%M:%S'),
            'timestamp': log.timestamp.isoformat(),
            'type': record_type,
            'statusCode': log.status,
            'deviceId': 'uFace800-Main'
        }
        
        # تجنب التكرار
        existing_ids = [r['id'] for r in employees_data[user_id]['attendance'][month_key]]
        if record['id'] not in existing_ids:
            employees_data[user_id]['attendance'][month_key].append(record)
    
    # حفظ كل موظف في ملف منفصل
    total_files = 0
    total_records = 0
    
    for user_id, data in employees_data.items():
        # اسم ملف آمن
        safe_name = data['profile']['name'].replace(' ', '_').replace('/', '_')
        filename = f"emp_{user_id}_{safe_name}.json"
        filepath = os.path.join(DATA_DIR, filename)
        
        # حفظ الملف
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        # حساب السجلات
        records_count = sum(len(records) for records in data['attendance'].values())
        total_records += records_count
        total_files += 1
        
        print(f"      ✓ {data['profile']['name']}: {records_count} سجل")
    
    # حفظ معلومات المزامنة
    metadata = {
        'lastSync': datetime.now().isoformat(),
        'totalEmployees': total_files,
        'totalRecords': total_records,
        'startDate': START_FILTER.isoformat(),
        'deviceIp': ZK_IP
    }
    
    with open('data/sync_metadata.json', 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    
    print("\n" + "="*70)
    print("✓ تمت المزامنة بنجاح!")
    print("="*70)
    print(f"الموظفين: {total_files}")
    print(f"السجلات: {total_records}")
    print(f"المجلد: {DATA_DIR}")
    print("="*70 + "\n")

except Exception as e:
    print(f"\n✗ خطأ: {e}")
    import traceback
    traceback.print_exc()

finally:
    if conn:
        conn.enable_device()
        conn.disconnect()
        print("✓ تم إغلاق الاتصال بأمان\n")
