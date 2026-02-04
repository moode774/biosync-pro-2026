# Firebase Setup Instructions

## Step 1: Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/u/1/)
2. Select your project: **coom-dce1c (COOM)**
3. Click on the gear icon ⚙️ → **Project Settings**
4. Scroll down to **Your apps** section
5. If no web app exists, click **Add app** → Select **Web** (</>) icon
6. Copy the `firebaseConfig` object

## Step 2: Update .env.local

Replace the placeholder values in `.env.local` with your actual Firebase config:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=coom-dce1c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=coom-dce1c
VITE_FIREBASE_STORAGE_BUCKET=coom-dce1c.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
VITE_FIREBASE_APP_ID=your_actual_app_id
```

## Step 3: Enable Firestore

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** (we'll set rules later)
4. Select a location (choose closest to your users)
5. Click **Enable**

## Step 4: Set Firestore Security Rules

Go to **Firestore Database** → **Rules** tab and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write to employees collection
    match /employees/{employeeId} {
      allow read, write: if true; // For development - restrict in production
      
      // Allow read/write to attendance subcollection
      match /attendance/{yearMonth}/records/{recordId} {
        allow read, write: if true;
      }
    }
    
    // Allow read/write to sync metadata
    match /sync-metadata/{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Step 5: Add Device Password

Update `.env.local` with your ZKTeco device admin password:

```env
VITE_DEVICE_PASSWORD=your_device_admin_password
```

## Step 6: Restart Dev Server

```bash
# Stop the current dev server (Ctrl+C)
npm run dev
```

## Done! 🎉

The application will now:
- ✅ Connect to Firebase
- ✅ Sync data from ZKTeco device
- ✅ Store in intelligent employee-centric structure
- ✅ Filter only 2026+ data
- ✅ Calculate work hours automatically
