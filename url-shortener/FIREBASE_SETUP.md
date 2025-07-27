# Firebase Setup Guide

## 🔥 **Quick Firebase Configuration**

The app is currently running in **Demo Mode** because Firebase isn't configured. Follow these steps to enable full functionality:

### **Step 1: Create Firebase Project**

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Click "Create a project"**
3. **Enter project name**: `url-shortener` (or your preferred name)
4. **Disable Google Analytics** (optional for this project)
5. **Click "Create project"**

### **Step 2: Enable Authentication**

1. **In Firebase Console**, go to **Authentication** → **Get started**
2. **Click "Sign-in method" tab**
3. **Enable "Email/Password"**:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

### **Step 3: Create Firestore Database**

1. **Go to Firestore Database** → **Create database**
2. **Choose "Start in test mode"** (for development)
3. **Select your preferred location**
4. **Click "Done"**

### **Step 4: Get Firebase Configuration**

1. **Go to Project Settings** (gear icon)
2. **Scroll down to "Your apps"**
3. **Click the web icon** `</>`
4. **Register your app**:
   - App nickname: `URL Shortener`
   - Don't check "Firebase Hosting"
   - Click "Register app"
5. **Copy the configuration object**

### **Step 5: Update Firebase Config**

Replace the demo configuration in `src/firebase.ts`:

```typescript
// Replace this demo config:
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

// With your actual Firebase config:
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### **Step 6: Set Firestore Security Rules (Optional)**

For better security, update Firestore rules:

1. **Go to Firestore Database** → **Rules**
2. **Replace with**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own links
    match /links/{linkId} {
      allow read: if true; // Anyone can read (for redirects)
      allow write: if request.auth != null && 
                      request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
    }
    
    // Allow anonymous link creation (optional)
    match /links/{linkId} {
      allow create: if request.resource.data.userId == "anonymous";
    }
  }
}
```

3. **Click "Publish"**

### **Step 7: Test the Configuration**

1. **Save the `firebase.ts` file**
2. **Refresh your browser** at http://localhost:5173/
3. **The yellow warning banner should disappear**
4. **Try creating an account** and **shortening a URL**

## 🎯 **What You'll Get After Setup**

### **✅ Full Authentication**
- User registration and login
- Protected dashboard access
- User-specific link management

### **✅ Database Functionality**
- Real link storage in Firestore
- Click tracking and analytics
- Link management (create, view, delete)

### **✅ Advanced Features**
- User dashboard with statistics
- Real-time click counting
- Link performance tracking
- Secure user data isolation

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **"Firebase configuration error"**
- Double-check your config object in `src/firebase.ts`
- Ensure all fields are filled with actual values (not demo values)

#### **"Permission denied" errors**
- Make sure Firestore is created and rules are set
- Check that authentication is enabled

#### **"Auth domain not authorized"**
- In Firebase Console → Authentication → Settings
- Add your domain (localhost:5173) to authorized domains

#### **Still seeing demo mode?**
- Hard refresh the browser (Ctrl+F5 or Cmd+Shift+R)
- Check browser console for any errors
- Verify the firebase config doesn't contain "demo-" values

## 🔧 **Development vs Production**

### **For Development (Current)**
- Use "Test mode" for Firestore
- Add localhost to authorized domains
- Enable Email/Password authentication

### **For Production (Later)**
- Update Firestore rules for production security
- Add your production domain to authorized domains
- Consider enabling additional auth providers (Google, GitHub, etc.)
- Set up proper environment variables

## 📞 **Need Help?**

If you encounter issues:

1. **Check the browser console** for error messages
2. **Verify Firebase project settings** match your configuration
3. **Ensure all Firebase services are enabled** (Auth + Firestore)
4. **Try creating a new Firebase project** if problems persist

Once configured, your URL shortener will have full functionality with user authentication, database storage, and click tracking! 🚀
