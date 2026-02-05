# -*- coding: utf-8 -*-
"""
مزامنة ذكية - تحديد الدخول/الخروج بذكاء
==========================================
يحدد الدخول/الخروج بناءً على:
1. الوقت (صباحاً = دخول، مساءً = خروج)
2. الترتيب (أول بصمة = دخول، آخر بصمة = خروج)
"""

from zk import ZK, const
from datetime import datetime
import json
import os
import sys
from collections import defaultdict

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
print("مزامنة ذكية - تحديد الدخول/الخروج تلقائياً")
print("="*70)

zk = ZK(ZK_IP, port=ZK_PORT, timeout=15)
conn = None

try:
    print(f"\n[1/5] الاتصال بالجهاز {ZK_IP}...")
    conn = zk.connect()
    print("      ✓ متصل")
    
    print("\n[2/5] قراءة الموظفين...")
    users = conn.get_users()
    user_map = {user.user_id: user.name for user in users}
    print(f"      ✓ {len(user_map)} موظف")
    
    print("\n[3/5] قراءة البصمات...")
    attendances = conn.get_attendance()
    attendances.sort(key=lambda x: x.timestamp)
    filtered = [log for log in attendances if log.timestamp >= START_FILTER]
    print(f"      ✓ {len(filtered)} سجل")
    
    print("\n[4/5] تحديد الدخول/الخروج بذكاء...")
    
    # تنظيم حسب الموظف واليوم
    daily_punches = defaultdict(lambda: defaultdict(list))
    
    for log in filtered:
        user_id = str(log.user_id)
        date_key = log.timestamp.strftime('%Y-%m-%d')
        daily_punches[user_id][date_key].append(log)
    
    # تنظيم البيانات النهائية
    employees_data = {}
    
    for user_id, dates in daily_punches.items():
        user_name = user_map.get(int(user_id), f"Unknown_{user_id}")
        
        employees_data[user_id] = {
            'profile': {
                'id': user_id,
                'name': user_name,
                'department': 'Not Specified',
                'position': 'Staff'
            },
            'attendance': {}
        }
        
        for date_key, punches in dates.items():
            # ترتيب البصمات حسب الوقت
            punches.sort(key=lambda x: x.timestamp)
            
            month_key = punches[0].timestamp.strftime('%Y-%m')
            if month_key not in employees_data[user_id]['attendance']:
                employees_data[user_id]['attendance'][month_key] = []
            
            # تحديد الدخول/الخروج بذكاء
            for i, punch in enumerate(punches):
                # المنطق الذكي:
                # 1. أول بصمة في اليوم = دخول
                # 2. آخر بصمة في اليوم = خروج
                # 3. البصمات في الوسط: حسب الوقت
                
                if i == 0:
                    # أول بصمة = دخول
                    record_type = 'check-in'
                elif i == len(punches) - 1:
                    # آخر بصمة = خروج
                    record_type = 'check-out'
                else:
                    # البصمات في الوسط: حسب الوقت
                    hour = punch.timestamp.hour
                    if hour < 12:
                        record_type = 'check-in'
                    else:
                        record_type = 'check-out'
                
                record = {
                    'id': f"{punch.timestamp.strftime('%Y%m%d_%H%M%S')}_{record_type}",
                    'date': punch.timestamp.strftime('%Y-%m-%d'),
                    'time': punch.timestamp.strftime('%H:%M:%S'),
                    'timestamp': punch.timestamp.isoformat(),
                    'type': record_type,
                    'statusCode': punch.status,
                    'deviceId': 'uFace800-Main'
                }
                
                # تجنب التكرار
                existing_ids = [r['id'] for r in employees_data[user_id]['attendance'][month_key]]
                if record['id'] not in existing_ids:
                    employees_data[user_id]['attendance'][month_key].append(record)
    
    print("\n[5/5] حفظ في ملفات JSON...")
    
    # حفظ كل موظف في ملف منفصل
    total_files = 0
    total_records = 0
    total_checkins = 0
    total_checkouts = 0
    
    for user_id, data in employees_data.items():
        # اسم ملف آمن
        safe_name = data['profile']['name'].replace(' ', '_').replace('/', '_')
        filename = f"emp_{user_id}_{safe_name}.json"
        filepath = os.path.join(DATA_DIR, filename)
        
        # حفظ الملف
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        # حساب الإحصائيات
        checkins = 0
        checkouts = 0
        for month_records in data['attendance'].values():
            for r in month_records:
                if r['type'] == 'check-in':
                    checkins += 1
                else:
                    checkouts += 1
        
        total_records += checkins + checkouts
        total_checkins += checkins
        total_checkouts += checkouts
        total_files += 1
        
        print(f"      ✓ {data['profile']['name']}: {checkins} دخول, {checkouts} خروج")
    
    # حفظ معلومات المزامنة
    metadata = {
        'lastSync': datetime.now().isoformat(),
        'totalEmployees': total_files,
        'totalRecords': total_records,
        'totalCheckins': total_checkins,
        'totalCheckouts': total_checkouts,
        'startDate': START_FILTER.isoformat(),
        'deviceIp': ZK_IP,
        'method': 'smart_detection'
    }
    
    with open('data/sync_metadata.json', 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    
    print("\n" + "="*70)
    print("✓ تمت المزامنة بنجاح!")
    print("="*70)
    print(f"الموظفين: {total_files}")
    print(f"إجمالي السجلات: {total_records}")
    print(f"  • دخول: {total_checkins}")
    print(f"  • خروج: {total_checkouts}")
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
