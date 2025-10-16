# WhatsApp Authentication, Google Maps Integration, and Delivery Management Implementation Guide

## Overview

This document provides a comprehensive guide for the enhanced KsheerMitra system with:
- WhatsApp-based authentication using OTP
- Google Maps integration for location handling
- Dynamic delivery area assignment
- Route optimization for delivery personnel

## Prerequisites

### API Keys Required

1. **WhatsApp Business Cloud API**
   - Facebook Developer Account
   - WhatsApp Business API access
   - Phone Number ID
   - Access Token
   - Message Template ID for OTP

2. **Google Maps Platform API**
   - Google Cloud Platform account
   - Enable the following APIs:
     - Maps JavaScript API
     - Places API
     - Directions API
     - Distance Matrix API
     - Geocoding API
   - Generate API key with appropriate restrictions

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

The following new dependency has been added:
- `axios@^1.6.2` - For HTTP requests to WhatsApp and Google APIs

### 2. Environment Configuration

Create or update `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=ksheermitra

# JWT Configuration
JWT_ACCESS_SECRET=your_jwt_access_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# Password Hashing
BCRYPT_ROUNDS=12

# WhatsApp Business Cloud API Configuration
WHATSAPP_API_KEY=your_whatsapp_business_api_key
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
WHATSAPP_VERIFY_TEMPLATE_ID=your_verification_template_name

# Google Maps API Configuration
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 3. Database Migration

Run the new migration to add WhatsApp authentication and location features:

```bash
psql -U postgres -d ksheermitra -f migrations/004_whatsapp_maps_integration.sql
```

This migration adds:
- WhatsApp number fields to users table
- Location coordinates (latitude/longitude)
- OTP verification table
- Delivery areas table
- Delivery routes and logs tables
- Support for multiple delivery boys

### 4. WhatsApp Business API Setup

#### Create a Message Template

1. Go to [Facebook Business Manager](https://business.facebook.com)
2. Navigate to WhatsApp Manager
3. Create a new message template:
   - Name: `verification_otp` (or your choice)
   - Category: Authentication
   - Language: English
   - Body: `Your KsheerMitra verification code is {{1}}. Valid for 10 minutes.`
   - Submit for approval

4. Once approved, use the template name in `WHATSAPP_VERIFY_TEMPLATE_ID`

#### Get API Credentials

1. Phone Number ID:
   - WhatsApp Manager → Phone Numbers → Copy Phone Number ID
   
2. Access Token:
   - WhatsApp Manager → API Setup → Temporary Access Token (for testing)
   - For production, create a System User and generate a permanent token

### 5. Google Maps Platform Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable APIs:
   - APIs & Services → Library
   - Search and enable:
     - Maps JavaScript API
     - Places API
     - Directions API
     - Distance Matrix API
     - Geocoding API

4. Create API Key:
   - APIs & Services → Credentials
   - Create Credentials → API Key
   - Restrict the API key:
     - Application restrictions: Set based on your needs
     - API restrictions: Select the enabled APIs above

5. Add the API key to `.env` as `GOOGLE_MAPS_API_KEY`

## Frontend Setup

### 1. Install Dependencies

```bash
cd ksheermitra
flutter pub get
```

New dependencies added:
- `google_maps_flutter@^2.5.3` - Google Maps widget
- `location@^5.0.3` - Location services
- `geocoding@^2.1.1` - Address geocoding
- `google_places_flutter@^2.0.9` - Places autocomplete

### 2. Android Configuration

Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest>
    <application>
        <!-- Add before </application> -->
        <meta-data
            android:name="com.google.android.geo.API_KEY"
            android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
    </application>
    
    <!-- Add before </manifest> -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.INTERNET"/>
</manifest>
```

### 3. iOS Configuration

Edit `ios/Runner/AppDelegate.swift`:

```swift
import UIKit
import Flutter
import GoogleMaps  // Add this import

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    GMSServices.provideAPIKey("YOUR_GOOGLE_MAPS_API_KEY")  // Add this
    GeneratedPluginRegistrant.register(with: self)
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
```

Edit `ios/Runner/Info.plist`:

```xml
<dict>
    <!-- Add these entries -->
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>This app needs access to location for delivery services.</string>
    <key>NSLocationAlwaysUsageDescription</key>
    <string>This app needs access to location for delivery tracking.</string>
</dict>
```

Edit `ios/Podfile`:

```ruby
# Uncomment this line
platform :ios, '12.0'
```

## API Endpoints

### Authentication

#### Send WhatsApp OTP
```
POST /auth/whatsapp/send-otp
Body: {
  "whatsapp_number": "+919876543210"
}
```

#### Verify WhatsApp OTP
```
POST /auth/whatsapp/verify-otp
Body: {
  "whatsapp_number": "+919876543210",
  "otp_code": "123456"
}
```

#### Complete WhatsApp Signup
```
POST /auth/whatsapp/complete-signup
Body: {
  "name": "John Doe",
  "whatsapp_number": "+919876543210",
  "phone": "9876543210",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "address_manual": "123 Main St, Bangalore"
}
```

### Delivery Area Management

#### Create Delivery Area (Admin)
```
POST /delivery-management/areas
Headers: Authorization: Bearer <token>
Body: {
  "name": "Zone A",
  "description": "North Bangalore",
  "delivery_boy_id": "uuid",
  "polygon_coordinates": [
    {"lat": 12.9716, "lng": 77.5946},
    {"lat": 12.9816, "lng": 77.5946},
    {"lat": 12.9816, "lng": 77.6046}
  ]
}
```

#### Get All Delivery Areas
```
GET /delivery-management/areas
Headers: Authorization: Bearer <token>
```

#### Assign Customers to Area
```
POST /delivery-management/areas/:areaId/assign-customers
Headers: Authorization: Bearer <token>
Body: {
  "customer_ids": ["uuid1", "uuid2"]
}
```

#### Get Customers with Location (Admin)
```
GET /delivery-management/customers/locations
Headers: Authorization: Bearer <token>
```

### Route Optimization

#### Generate Optimized Route
```
POST /delivery-management/routes/generate
Headers: Authorization: Bearer <token>
Body: {
  "delivery_boy_id": "uuid",
  "route_date": "2025-10-16",
  "delivery_boy_location": {
    "lat": 12.9716,
    "lng": 77.5946
  },
  "area_id": "uuid" // optional
}
```

#### Get Delivery Boy Routes
```
GET /delivery-management/routes/delivery-boy/:deliveryBoyId?route_date=2025-10-16
Headers: Authorization: Bearer <token>
```

#### Get Route Details
```
GET /delivery-management/routes/:routeId
Headers: Authorization: Bearer <token>
```

#### Update Route Status
```
PUT /delivery-management/routes/:routeId/status
Headers: Authorization: Bearer <token>
Body: {
  "status": "in_progress" // or "completed"
}
```

#### Update Delivery Log
```
PUT /delivery-management/logs/:logId
Headers: Authorization: Bearer <token>
Body: {
  "status": "completed",
  "notes": "Delivered successfully"
}
```

## Usage Flows

### Customer Flow

1. **First-time User**:
   - Opens app → WhatsApp Login Screen
   - Enters WhatsApp number
   - Receives OTP on WhatsApp
   - Enters OTP → Verification
   - New user → WhatsApp Signup Screen
   - Enters name
   - Selects location on map OR enters address manually
   - Completes signup → Logged in

2. **Returning User**:
   - Opens app → WhatsApp Login Screen
   - Enters WhatsApp number
   - Receives OTP on WhatsApp
   - Enters OTP → Logged in directly

### Admin Flow

1. **View All Customers on Map**:
   - Login → Admin Dashboard
   - Navigate to "Delivery Area Management"
   - See all customers with location pins on map

2. **Create Delivery Area**:
   - Draw polygon on map (future enhancement)
   - Or select customers manually
   - Assign to delivery boy
   - Save area

3. **Assign Customers to Delivery Boy**:
   - Select delivery area
   - View customers in area
   - Assign to specific delivery boy

### Delivery Boy Flow

1. **View Daily Route**:
   - Login → Delivery Dashboard
   - See today's route with all deliveries
   - View optimized route on map
   - See total distance and estimated time

2. **Start Route**:
   - Tap "Start Route"
   - Route status → In Progress
   - Navigate to each customer in order

3. **Complete Deliveries**:
   - Mark each delivery as completed
   - Add notes if needed
   - Progress tracked in real-time

4. **Complete Route**:
   - After all deliveries completed
   - Tap "Complete Route"
   - View summary statistics

## Testing

### Backend Testing

1. **Test WhatsApp OTP (Mock)**:
```bash
curl -X POST http://localhost:3000/auth/whatsapp/send-otp \
  -H "Content-Type: application/json" \
  -d '{"whatsapp_number": "+919876543210"}'
```

Note: In development, check console logs for OTP code if WhatsApp API is not configured.

2. **Test Route Optimization**:
```bash
curl -X POST http://localhost:3000/delivery-management/routes/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "delivery_boy_id": "uuid",
    "route_date": "2025-10-16",
    "delivery_boy_location": {"lat": 12.9716, "lng": 77.5946}
  }'
```

### Frontend Testing

1. **Run Flutter App**:
```bash
cd ksheermitra
flutter run
```

2. **Test WhatsApp Login**:
   - Navigate to WhatsApp Login Screen
   - Enter test number
   - Check for OTP in console (if mock mode)

3. **Test Location Picker**:
   - Complete signup flow
   - Test location selection on map
   - Verify coordinates are saved

## Troubleshooting

### WhatsApp API Issues

**Error: "WhatsApp API credentials not configured"**
- Check `.env` file has `WHATSAPP_API_KEY` and `WHATSAPP_PHONE_NUMBER_ID`
- Restart server after updating `.env`

**Error: "Failed to send OTP via WhatsApp"**
- Verify WhatsApp Business API is active
- Check phone number format (+country_code + number)
- Verify message template is approved

### Google Maps Issues

**Error: "Google Maps API key not configured"**
- Check `.env` file has `GOOGLE_MAPS_API_KEY`
- Verify API key is valid in Google Cloud Console

**Map not showing in Flutter**
- Check AndroidManifest.xml has API key
- Verify all required permissions are added
- Check API is enabled in Google Cloud Console

**Route optimization not working**
- Verify Directions API is enabled
- Check customers have valid latitude/longitude
- Ensure API key has no restrictions preventing access

### Database Issues

**Error: "relation does not exist"**
- Run migration: `psql -U postgres -d ksheermitra -f migrations/004_whatsapp_maps_integration.sql`

**Error: "null value in column violates not-null constraint"**
- Email is now nullable; update any queries that assume email exists
- Use `whatsapp_number` as primary identifier for WhatsApp users

## Security Considerations

1. **API Keys**:
   - Never commit `.env` file to version control
   - Use different keys for development and production
   - Restrict Google Maps API key by IP/domain in production

2. **OTP Security**:
   - OTP expires after 10 minutes
   - Maximum 5 attempts per OTP
   - Rate limiting on OTP requests

3. **Location Privacy**:
   - Customers can choose not to share precise location
   - Location data used only for delivery optimization
   - Admin can view customer locations only for delivery purposes

## Production Deployment

1. **Update Environment Variables**:
   - Use production WhatsApp Business API credentials
   - Use production Google Maps API key with proper restrictions
   - Set `NODE_ENV=production`

2. **Database**:
   - Backup database before migration
   - Run migrations in production
   - Verify data integrity

3. **Testing**:
   - Test complete authentication flow
   - Verify route optimization with real data
   - Test delivery completion workflow

4. **Monitoring**:
   - Monitor WhatsApp API usage and costs
   - Monitor Google Maps API usage and costs
   - Set up alerts for API failures
   - Track delivery completion rates

## Cost Estimation

### WhatsApp Business Cloud API
- Free tier: 1,000 conversations/month
- After free tier: ~$0.005 - $0.05 per conversation (varies by country)

### Google Maps Platform
- Monthly credit: $200 free
- Maps JavaScript API: $7 per 1,000 loads
- Directions API: $5 per 1,000 requests
- Distance Matrix API: $5 per 1,000 elements
- Geocoding API: $5 per 1,000 requests

**Estimated costs for 100 daily deliveries**:
- WhatsApp: ~$15/month (300 users)
- Google Maps: ~$50/month (route optimization + maps)
- Total: ~$65/month

## Support and Maintenance

For issues or questions:
1. Check this documentation
2. Review error logs in backend console
3. Check API status (WhatsApp, Google Maps)
4. Verify environment configuration
5. Test with mock data to isolate issues

## Future Enhancements

Possible improvements:
1. Real-time delivery tracking
2. Push notifications for delivery updates
3. Advanced polygon drawing for delivery areas
4. Multiple delivery routes per day
5. Customer delivery preferences
6. Delivery performance analytics
7. Integration with payment systems
8. SMS fallback for OTP if WhatsApp fails
