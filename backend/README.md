# 🚀 How to Start the Backend Proxy Server

## Quick Start

### 1. Install Python (if not installed)
Download from: https://www.python.org/downloads/

### 2. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Start the Server
```bash
python proxy_server.py
```

You should see:
```
============================================================
🔒 ZKTeco READ-ONLY Proxy Server
============================================================

📍 Device: 10.10.1.127
🔐 Username: 4444
📅 Year Filter: 2026+

⚠️  SAFETY MODE: READ-ONLY - Device data will NOT be modified

🌐 Starting server on http://localhost:5000
============================================================
```

### 4. Test the Server
Open browser: http://localhost:5000/api/health

You should see:
```json
{
  "status": "healthy",
  "mode": "READ-ONLY",
  "device": "10.10.1.127",
  "safety": "Device data will NOT be modified"
}
```

### 5. Use the App
Now go back to your app at http://localhost:3001 and click **Sync Now**!

## Troubleshooting

### "Module not found" error
```bash
pip install flask flask-cors requests beautifulsoup4
```

### "Port 5000 already in use"
Change port in `proxy_server.py`:
```python
app.run(host='0.0.0.0', port=5001, debug=True)
```

And update frontend in `deviceService.ts`:
```typescript
const PROXY_URL = 'http://localhost:5001/api/sync';
```

## Safety Notes

⚠️ This server is **READ-ONLY**:
- ✅ Only reads data from device
- ❌ Never writes to device
- ❌ Never deletes from device
- ❌ Never modifies device data

The device remains 100% safe and untouched!
