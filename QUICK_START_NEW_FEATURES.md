# Quick Start Guide - WhatsApp Auth & Delivery Management

## Setup in 5 Minutes

### 1. Backend Setup

```bash
# Install dependencies
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials:
# - WHATSAPP_API_KEY
# - WHATSAPP_PHONE_NUMBER_ID  
# - GOOGLE_MAPS_API_KEY

# Run database migration
psql -U postgres -d ksheermitra -f migrations/004_whatsapp_maps_integration.sql

# Start server
npm start
```

### 2. Frontend Setup

```bash
# Install dependencies
cd ksheermitra
flutter pub get

# Update Android config
# Edit android/app/src/main/AndroidManifest.xml
# Add: <meta-data android:name="com.google.android.geo.API_KEY" android:value="YOUR_KEY"/>

# Run app
flutter run
```

## Key Features

### WhatsApp Authentication
- **Endpoint**: `POST /auth/whatsapp/send-otp`
- **Body**: `{"whatsapp_number": "+919876543210"}`
- OTP expires in 10 minutes
- Max 5 verification attempts

### Location Handling
- Users can select location on map
- Or enter address manually (auto-geocoded)
- Coordinates stored: latitude, longitude
- Used for delivery route optimization

### Delivery Area Assignment
- **Admin**: View all customers on map
- Create delivery zones (polygon coordinates)
- Assign customers to delivery boys
- **Endpoint**: `POST /delivery-management/areas`

### Route Optimization
- **Generate**: `POST /delivery-management/routes/generate`
- Uses Google Directions API
- Returns optimized customer order
- Shows total distance and ETA
- Delivery boy marks each delivery complete

## Testing Without API Keys

For development without WhatsApp/Google credentials:

1. **Mock WhatsApp OTP**:
   - Comment out `sendOtpViaWhatsApp()` call in `authService.js`
   - Log OTP to console instead
   - OTP still saved to database

2. **Mock Route Optimization**:
   - Use simple distance calculation
   - Return customers in original order
   - Comment out Google API calls

## Common Issues

**"WhatsApp API credentials not configured"**
→ Add to `.env`: `WHATSAPP_API_KEY` and `WHATSAPP_PHONE_NUMBER_ID`

**"Google Maps API key not configured"**  
→ Add to `.env`: `GOOGLE_MAPS_API_KEY`

**Map not showing in Flutter**
→ Add API key to `AndroidManifest.xml` and `AppDelegate.swift`

**Migration fails**
→ Check database connection in `.env`
→ Ensure PostgreSQL is running

## API Quick Reference

### Auth
- `POST /auth/whatsapp/send-otp` - Send OTP
- `POST /auth/whatsapp/verify-otp` - Verify OTP  
- `POST /auth/whatsapp/complete-signup` - Complete signup

### Delivery Management
- `POST /delivery-management/areas` - Create area
- `GET /delivery-management/areas` - List areas
- `POST /delivery-management/areas/:id/assign-customers` - Assign customers
- `POST /delivery-management/routes/generate` - Generate route
- `GET /delivery-management/routes/delivery-boy/:id` - Get routes
- `PUT /delivery-management/routes/:id/status` - Update route status
- `PUT /delivery-management/logs/:id` - Update delivery log

## Production Checklist

- [ ] WhatsApp Business API approved template
- [ ] Production WhatsApp API credentials  
- [ ] Google Maps API key with restrictions
- [ ] Database migration completed
- [ ] `.env` configured correctly
- [ ] API rate limits configured
- [ ] Monitoring set up
- [ ] Backup strategy in place

## Need Help?

Refer to `WHATSAPP_MAPS_SETUP.md` for:
- Detailed API setup instructions
- Full endpoint documentation
- Troubleshooting guide
- Cost estimation
- Security best practices
