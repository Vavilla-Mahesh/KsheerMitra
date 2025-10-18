# Flutter-Node.js Integration - Setup Guide

## Overview

This guide will help you set up the complete integration between the Flutter mobile app and the Node.js + PostgreSQL backend for the KsheerMitra milk delivery management system.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed
- Flutter SDK 3.0+ installed
- Android Studio or Xcode (for mobile app development)
- Google Maps API Key
- WhatsApp account for business (optional)

---

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=*

# Database Configuration (PostgreSQL)
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_password
PG_DATABASE=ksheermitra

# JWT Configuration
JWT_SECRET=your_secret_key_change_in_production

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# WhatsApp Configuration
WHATSAPP_SESSION_PATH=./sessions
ENABLE_WHATSAPP=true

# Cron Jobs
ENABLE_CRON=true
```

### 3. Set Up Database

Run the migration scripts to create tables:

```bash
psql -U postgres -d ksheermitra -f migrations/001_initial_schema.sql
psql -U postgres -d ksheermitra -f migrations/002_add_enhanced_features.sql
psql -U postgres -d ksheermitra -f migrations/003_add_billing_adjustments.sql
psql -U postgres -d ksheermitra -f migrations/004_whatsapp_googlemaps_integration.sql
```

Or let Sequelize auto-create tables (development only):

```javascript
// In server.js, set:
await sequelize.sync({ alter: true });
```

### 4. Initialize System Users

The server automatically creates default admin and delivery boy users on first run.

### 5. Start the Backend Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will start on http://localhost:5000

### 6. Test Backend Endpoints

```bash
# Health check
curl http://localhost:5000/health

# Meta info
curl http://localhost:5000/meta
```

---

## WhatsApp Setup (Optional but Recommended)

### 1. First-Time Setup

When you start the server with `ENABLE_WHATSAPP=true`, a QR code will appear in the terminal.

### 2. Scan QR Code

- Open WhatsApp on your phone
- Go to Settings → Linked Devices
- Tap "Link a Device"
- Scan the QR code from terminal

### 3. Session Persistence

Once authenticated, the session is saved in `./sessions` directory and will persist across restarts.

---

## Flutter App Setup

### 1. Install Flutter Dependencies

```bash
cd ksheermitra
flutter pub get
```

### 2. Configure API Base URL

Update the base URL in `lib/config/api_config.dart`:

```dart
static const String baseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://your-server-ip:5000',
);
```

Or pass it during build:

```bash
flutter run --dart-define=API_BASE_URL=http://192.168.1.100:5000
```

### 3. Google Maps Setup

#### For Android:

1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)

2. Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest>
    <application>
        <meta-data
            android:name="com.google.android.geo.API_KEY"
            android:value="YOUR_API_KEY_HERE"/>
    </application>
</manifest>
```

3. Enable required APIs in Google Cloud Console:
   - Maps SDK for Android
   - Places API
   - Geocoding API
   - Directions API

#### For iOS:

1. Add to `ios/Runner/AppDelegate.swift`:

```swift
import GoogleMaps

GMSServices.provideAPIKey("YOUR_API_KEY_HERE")
```

2. Enable required APIs in Google Cloud Console:
   - Maps SDK for iOS
   - Places API
   - Geocoding API
   - Directions API

### 4. Location Permissions

#### For Android:

Permissions are already configured in `android/app/src/main/AndroidManifest.xml`

#### For iOS:

Add to `ios/Runner/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show delivery addresses on the map</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>We need your location to track deliveries</string>
```

### 5. Run the Flutter App

```bash
flutter run
```

Or for release build:

```bash
flutter build apk --release
flutter build ios --release
```

---

## Testing the Integration

### 1. Test OTP Login Flow

**From Flutter App:**

1. Open the app
2. Click "Login with OTP"
3. Enter phone number (e.g., +919876543210)
4. Check console for OTP (development mode)
5. Enter OTP and verify

**Expected Result:**
- User is logged in
- Profile setup screen appears (for new users)
- Home screen appears (for existing users)

### 2. Test Location Capture

**From Flutter App:**

1. Complete profile after OTP login
2. Click "Capture Location"
3. Allow location permissions
4. Verify coordinates are displayed

**Expected Result:**
- Latitude and longitude captured
- Profile saved with location data

### 3. Test Delivery Boy Map

**Prerequisites:**
- Login as delivery boy (role: DELIVERY)
- Admin must assign customers to delivery boy

**From Flutter App:**

1. Navigate to Delivery Map
2. View customer markers on map
3. Tap a marker to see customer details
4. Mark delivery as DELIVERED or MISSED

**Expected Result:**
- Map shows all assigned customers
- Route optimization displayed (if available)
- WhatsApp notification sent to customer

### 4. Test Invoice Generation

**Daily Invoice (Delivery Boy):**

1. Complete all deliveries for the day
2. Click "End Day" button
3. Confirm invoice generation

**Expected Result:**
- PDF invoice generated
- Sent to admin via WhatsApp
- Stored in database

**Monthly Invoice (Admin):**

1. Navigate to Invoices screen
2. Enter customer ID
3. Click "Generate Monthly Invoice"

**Expected Result:**
- PDF invoice generated for previous month
- Sent to customer via WhatsApp
- Stored in database

---

## API Endpoints Summary

### Authentication
- `POST /api/auth/send-otp` - Request OTP
- `POST /api/auth/verify-otp` - Verify OTP and login
- `PUT /api/auth/profile` - Update profile with location
- `GET /api/auth/profile` - Get current user profile

### Delivery
- `GET /api/delivery/assigned-customers` - Get assigned customers with route
- `PUT /api/delivery/status/:id` - Update delivery status
- `POST /api/delivery/invoice/daily` - Generate daily invoice
- `GET /api/delivery/stats` - Get delivery statistics

### Invoices
- `POST /api/invoice/monthly/:customerId` - Generate monthly invoice
- `GET /api/invoice/customer/:customerId` - Get customer invoices

### Products
- `GET /products` - Get all products

### Subscriptions
- `POST /subscriptions` - Create subscription

### Admin
- `POST /api/admin/area/assign` - Assign area to delivery boy
- `GET /api/admin/dashboard/stats` - Get dashboard statistics

For detailed API documentation, see [FLUTTER_API_INTEGRATION.md](FLUTTER_API_INTEGRATION.md)

---

## Troubleshooting

### Backend Issues

**Database Connection Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database `ksheermitra` exists

**WhatsApp Not Working:**
```
WhatsApp client not ready
```
- Scan QR code to authenticate
- Check `ENABLE_WHATSAPP` is set to `true`
- Verify `./sessions` directory has write permissions

**Google Maps API Error:**
```
Google Maps API key not configured
```
- Set `GOOGLE_MAPS_API_KEY` in `.env`
- Enable required APIs in Google Cloud Console

### Flutter Issues

**API Connection Failed:**
```
DioException: Connection refused
```
- Verify backend server is running
- Check `API_BASE_URL` in Flutter config
- Ensure device/emulator can reach server IP

**Google Maps Not Showing:**
```
MissingPluginException
```
- Run `flutter pub get`
- Rebuild the app
- Verify API key is configured correctly

**Location Permission Denied:**
- Check app permissions in device settings
- Verify Info.plist (iOS) or AndroidManifest.xml (Android)
- Request permissions explicitly in code

---

## Production Deployment

### Backend

1. **Set Environment to Production:**
   ```env
   NODE_ENV=production
   ```

2. **Use Strong JWT Secret:**
   ```env
   JWT_SECRET=generate_a_strong_random_string
   ```

3. **Configure CORS:**
   ```env
   CORS_ORIGIN=https://your-app-domain.com
   ```

4. **Use Database Migrations:**
   - Don't use `sequelize.sync({ alter: true })` in production
   - Use proper migration files

5. **Enable HTTPS:**
   - Use reverse proxy (nginx)
   - Configure SSL certificates

### Flutter

1. **Update API URL:**
   ```dart
   defaultValue: 'https://api.yourdomain.com'
   ```

2. **Build Release APK/IPA:**
   ```bash
   flutter build apk --release
   flutter build ios --release
   ```

3. **Sign the App:**
   - Android: Configure signing keys
   - iOS: Configure provisioning profiles

4. **Submit to Stores:**
   - Google Play Store
   - Apple App Store

---

## Security Best Practices

1. **Never commit sensitive data:**
   - Add `.env` to `.gitignore`
   - Use environment variables for secrets

2. **Validate all inputs:**
   - Backend validates all user inputs
   - Flutter validates before sending

3. **Use rate limiting:**
   - All routes are rate-limited
   - Prevents abuse and DoS attacks

4. **Secure file paths:**
   - All file operations use path validation
   - Prevents path traversal attacks

5. **Keep dependencies updated:**
   ```bash
   npm audit
   npm update
   flutter pub outdated
   ```

---

## Support

For issues or questions:
- Check documentation in `/backend/README.md`
- Review API docs in `FLUTTER_API_INTEGRATION.md`
- Contact system administrator

---

## License

This project is proprietary software. All rights reserved.
