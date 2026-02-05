from zk import ZK, const
from datetime import datetime
import csv
import os

# إعدادات الجهاز
ZK_IP = '10.10.1.127'
ZK_PORT = 4370

zk = ZK(ZK_IP, port=ZK_PORT, timeout=15)
conn = None

try:
    print(f"Connecting to {ZK_IP}...")
    conn = zk.connect()
    
    # 1. سحب الأسماء لربطها بالـ ID
    print("Reading employee names...")
    users = conn.get_users()
    user_map = {user.user_id: user.name for user in users}
    
    # 2. سحب جميع البصمات (قراءة فقط)
    print("Reading attendance logs...")
    attendances = conn.get_attendance()
    
    # 3. ترتيب البصمات زمنياً (من الأقدم للأحدث)
    attendances.sort(key=lambda x: x.timestamp)
    
    # 4. فلترة وتوزيع البيانات حسب الشهر (بداية من 2026)
    records_by_month = {}
    start_date = datetime(2026, 1, 1)

    for log in attendances:
        if log.timestamp >= start_date:
            # مفتاح الشهر (مثلاً: 2026-01)
            month_key = log.timestamp.strftime('%Y-%m')
            if month_key not in records_by_month:
                records_by_month[month_key] = []
            
            # إضافة البيانات مع الاسم
            records_by_month[month_key].append([
                log.user_id,
                user_map.get(log.user_id, "Unknown"),
                log.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                log.status
            ])

    # 5. إنشاء الملفات لكل شهر
    for month, records in records_by_month.items():
        filename = f"Attendance_{month}.csv"
        with open(filename, mode='w', newline='', encoding='utf-8-sig') as file:
            writer = csv.writer(file)
            writer.writerow(['رقم الموظف', 'الاسم', 'الوقت والتاريخ', 'الحالة'])
            writer.writerows(records)
        print(f"✔ تم إنشاء ملف شهر {month} بنجاح: {len(records)} حركة.")

    print("\n--- انتهى العمل بنجاح ---")

except Exception as e:
    print(f"❌ خطأ: {e}")
finally:
    if conn:
        conn.enable_device() # التأكد أن الجهاز يعمل للموظفين
        conn.disconnect()
        from zk import ZK, const
from datetime import datetime
import csv

# إعدادات الجهاز
ZK_IP = '10.10.1.127'
ZK_PORT = 4370

zk = ZK(ZK_IP, port=ZK_PORT, timeout=15)
conn = None

try:
    print(f"Connecting to {ZK_IP}...")
    conn = zk.connect()
    
    # 1. سحب الأسماء لربطها
    users = conn.get_users()
    user_map = {user.user_id: user.name for user in users}
    
    # 2. سحب جميع السجلات من ذاكرة الجهاز
    print("Reading all logs...")
    attendances = conn.get_attendance()
    
    # 3. ترتيب البيانات زمنياً (باليوم والساعة والدقيقة)
    attendances.sort(key=lambda x: x.timestamp)
    
    # 4. تحديد بداية السحب (1 ديسمبر 2025)
    start_filter = datetime(2025, 12, 1)
    
    # اسم الملف سيكون باسم اليوم لتعرف متى استخرجته
    current_today = datetime.now().strftime('%Y-%m-%d')
    filename = f"Full_Attendance_Report_UpTo_{current_today}.csv"

    with open(filename, mode='w', newline='', encoding='utf-8-sig') as file:
        writer = csv.writer(file)
        # العناوين بالترتيب الذي طلبته
        writer.writerow(['رقم الموظف', 'الاسم', 'التاريخ', 'الساعة والوقت', 'الحالة برقمها', 'نوع الحركة'])
        
        counter = 0
        for log in attendances:
            if log.timestamp >= start_filter:
                # تحديد نوع الحركة بناءً على الكود البرمجي للجهاز
                status_desc = "دخول" if log.status in [0, 15, 4] else "خروج" if log.status in [1, 5] else "غير محدد"
                
                writer.writerow([
                    log.user_id,                         # ID
                    user_map.get(log.user_id, "Unknown"), # الاسم
                    log.timestamp.strftime('%Y-%m-%d'),  # اليوم
                    log.timestamp.strftime('%H:%M:%S'),  # الساعة والدقيقة والثانية
                    log.status,                          # الكود الأصلي للجهاز (للأمانة)
                    status_desc                          # شرح الحالة (دخول/خروج)
                ])
                counter += 1

    print(f"✔ تم بنجاح! الملف جاهز باسم: {filename}")
    print(f"✔ إجمالي السجلات المستخرجة: {counter} سجل.")

except Exception as e:
    print(f"❌ خطأ: {e}")
finally:
    if conn:
        conn.enable_device()
        conn.disconnect()
        print("Device connection closed safely.")