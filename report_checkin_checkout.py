# -*- coding: utf-8 -*-
"""
تقرير تفصيلي عن الدخول والخروج
================================
"""
import json
import os
import sys

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DATA_DIR = 'data/employees'

print("="*70)
print("تقرير الدخول والخروج - جميع الموظفين")
print("="*70)

total_checkins = 0
total_checkouts = 0
employees_with_no_checkouts = []

for filename in os.listdir(DATA_DIR):
    if not filename.endswith('.json'):
        continue
    
    filepath = os.path.join(DATA_DIR, filename)
    with open(filepath, encoding='utf-8') as f:
        data = json.load(f)
    
    emp_name = data['profile']['name']
    emp_checkins = 0
    emp_checkouts = 0
    
    for month, records in data['attendance'].items():
        for record in records:
            if record['type'] == 'check-in':
                emp_checkins += 1
            elif record['type'] == 'check-out':
                emp_checkouts += 1
    
    total_checkins += emp_checkins
    total_checkouts += emp_checkouts
    
    if emp_checkouts == 0:
        employees_with_no_checkouts.append(emp_name)
    
    if emp_checkouts > 0:  # فقط الموظفين اللي عندهم خروج
        print(f"\n{emp_name}:")
        print(f"  دخول: {emp_checkins}")
        print(f"  خروج: {emp_checkouts}")
        print(f"  نسبة الخروج: {(emp_checkouts/emp_checkins*100):.1f}%")

print("\n" + "="*70)
print("الإحصائيات الإجمالية")
print("="*70)
print(f"إجمالي الدخول: {total_checkins}")
print(f"إجمالي الخروج: {total_checkouts}")
print(f"نسبة الخروج: {(total_checkouts/total_checkins*100):.1f}%")

print(f"\nالموظفين بدون أي تسجيل خروج: {len(employees_with_no_checkouts)}")
if employees_with_no_checkouts:
    print("\nقائمة الموظفين بدون خروج:")
    for name in employees_with_no_checkouts[:10]:  # أول 10 فقط
        print(f"  - {name}")
    if len(employees_with_no_checkouts) > 10:
        print(f"  ... و {len(employees_with_no_checkouts) - 10} موظف آخر")

print("\n" + "="*70)
print("التوصيات")
print("="*70)
print("1. الموظفون يسجلون دخول أكثر من خروج")
print("2. قد يكون الجهاز مضبوط على تسجيل كل بصمة كـ 'دخول'")
print("3. تحقق من إعدادات الجهاز لتفعيل تسجيل الخروج التلقائي")
print("="*70 + "\n")
