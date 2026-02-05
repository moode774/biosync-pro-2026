# -*- coding: utf-8 -*-
import json
import sys

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# قراءة ملف موظف واحد
with open('data/employees/emp_1_Anwar_hussain.json', encoding='utf-8') as f:
    data = json.load(f)

# فحص ديسمبر 2025
records = data['attendance']['2025-12']

checkins = [r for r in records if r['type'] == 'check-in']
checkouts = [r for r in records if r['type'] == 'check-out']

print(f"إجمالي السجلات: {len(records)}")
print(f"Check-ins (دخول): {len(checkins)}")
print(f"Check-outs (خروج): {len(checkouts)}")
print("\nأول 10 سجلات خروج:")
print("-" * 60)

for r in checkouts[:10]:
    print(f"{r['date']} {r['time']} - Status Code: {r['statusCode']}")
