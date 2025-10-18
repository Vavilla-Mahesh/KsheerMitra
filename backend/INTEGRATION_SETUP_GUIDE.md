# Google Maps & WhatsApp Integration - Setup Guide

## 🎯 Overview

This implementation adds production-ready WhatsApp OTP authentication, Google Maps API integration, and automated invoice generation to KsheerMitra.

## 🆕 New Features

### 1. **WhatsApp OTP Authentication**
- ✅ OTP-based login via WhatsApp
- ✅ No password required
- ✅ Automatic user creation on first login
- ✅ JWT token-based session management
- ✅ 10-minute OTP expiry

### 2. **Google Maps API Integration**
- ✅ Address geocoding (convert addresses to coordinates)
- ✅ Reverse geocoding (coordinates to addresses)
- ✅ Route optimization for delivery boys
- ✅ Distance and duration calculations
- ✅ Optimized waypoint ordering

### 3. **Automated Invoice Generation**
- ✅ Daily invoices for delivery boys (PDF)
- ✅ Monthly invoices for customers (PDF)
- ✅ Automatic WhatsApp delivery
- ✅ Professional PDF templates with pdfkit

### 4. **Cron Job Automation**
- ✅ Daily invoice generation at 8 PM
- ✅ Monthly invoice generation on 1st at 9 AM
- ✅ Configurable scheduling with node-cron

### 5. **Enhanced Delivery Management**
- ✅ Area-based customer assignment
- ✅ Route optimization for efficient deliveries
- ✅ Real-time status updates with WhatsApp notifications
- ✅ Delivery statistics and analytics

## 📦 New Dependencies

```json
{
  "sequelize": "^6.37.5",
  "@googlemaps/google-maps-services-js": "^3.4.0",
  "whatsapp-web.js": "^1.25.0",
  "pdfkit": "^0.15.0",
  "node-cron": "^3.0.3",
  "qrcode-terminal": "^0.12.0"
}
```

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database (PostgreSQL)
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_password
PG_DATABASE=ksheermitra

# JWT Secret (CHANGE IN PRODUCTION!)
JWT_SECRET=your_very_secure_secret_key_change_this

# Google Maps API Key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# WhatsApp Integration
ENABLE_WHATSAPP=true
WHATSAPP_SESSION_PATH=./sessions

# Cron Jobs
ENABLE_CRON=true
```

### 3. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Geocoding API
   - Directions API
   - Distance Matrix API
4. Create credentials (API Key)
5. Copy the API key to `.env`

**Important**: Set up billing and usage limits to avoid unexpected charges.

### 4. Run Database Migration

```bash
# Connect to PostgreSQL
psql -U postgres -d ksheermitra

# Run the migration
\i migrations/004_whatsapp_googlemaps_integration.sql

# Exit
\q
```

Or use a single command:

```bash
psql -U postgres -d ksheermitra -f migrations/004_whatsapp_googlemaps_integration.sql
```

### 5. Start the Server

```bash
npm start
```

### 6. WhatsApp Authentication (First Time Only)

If `ENABLE_WHATSAPP=true`, on first run you'll see a QR code in the terminal:

```
WhatsApp QR Code received. Scan this to authenticate:
[QR CODE APPEARS HERE]
```

1. Open WhatsApp on your phone
2. Go to Settings → Linked Devices
3. Scan the QR code
4. Wait for "WhatsApp client is ready!" message

The session will be saved in `./sessions` directory and reused on subsequent starts.

## 🧪 Testing the Integration

### Test 1: Request OTP

```bash
curl -X POST http://localhost:5000/api/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'
```

Expected response:
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otpSentViaWhatsApp": true
}
```

**Note**: Check WhatsApp for the OTP message. In development mode, OTP is also logged to console.

### Test 2: Verify OTP

```bash
curl -X POST http://localhost:5000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "otp": "123456"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "User_3210",
    "phone": "+919876543210",
    "role": "CUSTOMER"
  }
}
```

Save the token for authenticated requests.

### Test 3: Update Profile (with Auto-Geocoding)

```bash
TOKEN="your_jwt_token_here"

curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "address": "Bangalore, Karnataka, India"
  }'
```

Expected response:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "+919876543210",
    "role": "CUSTOMER",
    "address": "Bangalore, Karnataka, India",
    "latitude": 12.9716,
    "longitude": 77.5946
  }
}
```

Notice that address is geocoded automatically!

### Test 4: Admin - Create Delivery Boy

First, you need an admin token. You can use the existing admin account or create one.

```bash
ADMIN_TOKEN="admin_jwt_token"

curl -X POST http://localhost:5000/api/admin/delivery-boys \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ravi Kumar",
    "phone": "+919876543211",
    "address": "Whitefield, Bangalore"
  }'
```

### Test 5: Admin - Assign Area

```bash
ADMIN_TOKEN="admin_jwt_token"

curl -X POST http://localhost:5000/api/admin/area/assign \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deliveryBoyId": "delivery_boy_uuid",
    "areaName": "North Zone",
    "customerIds": ["customer_uuid1", "customer_uuid2"]
  }'
```

## 📱 User Roles

### CUSTOMER
- Login with phone + OTP
- Update profile
- View subscriptions
- Receive delivery notifications
- Receive monthly invoices

### DELIVERY (Delivery Boy)
- Login with phone + OTP
- View assigned customers with route map
- Update delivery status (PENDING/DELIVERED/MISSED)
- Generate daily invoices
- View delivery statistics

### ADMIN
- Login with phone + OTP
- Assign areas to delivery boys
- View dashboard statistics
- Monitor all deliveries
- View all invoices
- Create delivery boys
- Manage customers and products

## 🔄 Automated Workflows

### Daily Invoice Flow
1. Delivery boy completes deliveries for the day
2. At 8 PM, cron job runs
3. System generates PDF invoice for each delivery boy
4. Invoice sent to admin via WhatsApp
5. Invoice saved in database with status

### Monthly Invoice Flow
1. On 1st of month at 9 AM, cron job runs
2. System generates PDF invoice for each customer
3. Includes all deliveries from previous month
4. Invoice sent to customer via WhatsApp
5. Invoice saved in database

### Delivery Notification Flow
1. Delivery boy marks delivery as DELIVERED or MISSED
2. System immediately sends WhatsApp notification to customer
3. Status updated in database
4. Admin can monitor in real-time

## 🗺️ Google Maps Features

### Address Geocoding
Automatically converts addresses to coordinates when:
- Customer updates profile
- Admin creates delivery boy
- Area assignment is made

### Route Optimization
When delivery boy requests assigned customers:
- System calculates optimal route
- Returns ordered list of customers
- Provides distance and duration
- Includes polyline for map visualization

### Distance Calculation
Used for:
- Delivery route planning
- Area assignment optimization
- Delivery time estimation

## 📄 API Endpoints

### Authentication
- `POST /api/auth/otp/request` - Request OTP
- `POST /api/auth/otp/verify` - Verify OTP and login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Delivery Boy
- `GET /api/delivery/assigned-customers` - Get assigned customers with route
- `PUT /api/delivery/status/:id` - Update delivery status
- `POST /api/delivery/invoice/daily` - Generate daily invoice
- `GET /api/delivery/stats` - Get delivery statistics

### Admin
- `POST /api/admin/area/assign` - Assign area to delivery boy
- `GET /api/admin/area/assignments` - Get all area assignments
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/invoices` - Get all invoices
- `GET /api/admin/delivery-statuses` - Get all delivery statuses
- `POST /api/admin/delivery-boys` - Create delivery boy
- `GET /api/admin/delivery-boys` - Get all delivery boys

Full API documentation: [`WHATSAPP_GOOGLEMAPS_API_DOCS.md`](./WHATSAPP_GOOGLEMAPS_API_DOCS.md)

## 🏗️ Database Schema

### New Tables

1. **delivery_status** - Tracks delivery per customer per day
   - delivery_boy_id, customer_id, subscription_id
   - date, status (PENDING/DELIVERED/MISSED)

2. **invoices** - Stores generated invoices
   - generated_by, target_user_id
   - type (DAILY/MONTHLY), amount, pdf_path
   - sent_via_whatsapp flag

3. **area_assignments** - Maps delivery boys to areas
   - delivery_boy_id, area_name
   - customers (array of UUIDs)

### Updated Tables

**users** table additions:
- otp, otp_expiry (for OTP authentication)
- latitude, longitude (from geocoding)
- area_id (for area assignment)

## 🔒 Security Features

1. **JWT Token**: 30-day expiration, secure secret
2. **OTP Expiry**: 10 minutes timeout
3. **Role-based Access Control**: Middleware enforcement
4. **API Key Protection**: Environment variable storage
5. **Session Management**: Local WhatsApp session storage

## 🐛 Troubleshooting

### WhatsApp QR Code Not Showing
```bash
# Check if WhatsApp is enabled
echo $ENABLE_WHATSAPP  # Should be 'true'

# Check sessions directory
ls -la sessions/

# Remove old session and restart
rm -rf sessions/
npm start
```

### Google Maps API Errors
```bash
# Test API key
curl "https://maps.googleapis.com/maps/api/geocode/json?address=Bangalore&key=YOUR_API_KEY"

# Check API is enabled in Google Cloud Console
# Verify billing is set up
```

### Database Connection Issues
```bash
# Test PostgreSQL connection
psql -U postgres -d ksheermitra -c "SELECT 1"

# Check environment variables
cat .env | grep DB_
```

### OTP Not Received
- Check WhatsApp service is initialized
- Verify phone number format (+country_code + number)
- Check WhatsApp session is active
- Look for OTP in console logs (development mode)

## 📚 Additional Resources

- [WhatsApp Web.js Documentation](https://wwebjs.dev/)
- [Google Maps Services](https://developers.google.com/maps/documentation)
- [Sequelize ORM](https://sequelize.org/docs/v6/)
- [PDFKit Documentation](http://pdfkit.org/)
- [Node-cron Documentation](https://github.com/node-cron/node-cron)

## 🚀 Production Deployment

### Pre-deployment Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Set NODE_ENV=production
- [ ] Set up Google Maps API billing limits
- [ ] Configure WhatsApp session backup
- [ ] Set up database backups
- [ ] Configure proper CORS_ORIGIN
- [ ] Set up SSL/TLS certificates
- [ ] Test cron jobs timezone
- [ ] Review rate limiting settings

### Environment Variables for Production

```bash
NODE_ENV=production
JWT_SECRET=<generate-strong-random-key>
DATABASE_URL=postgresql://user:pass@host:5432/dbname
GOOGLE_MAPS_API_KEY=<your-key>
ENABLE_WHATSAPP=true
ENABLE_CRON=true
CORS_ORIGIN=https://yourdomain.com
```

### Recommended Server Setup

- **CPU**: 2+ cores
- **RAM**: 2GB+ (WhatsApp + Node.js)
- **Storage**: 20GB+ (for invoices and sessions)
- **OS**: Ubuntu 20.04+ or similar

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API documentation
3. Check server logs for detailed error messages
4. Create an issue on GitHub

## 🎉 What's Next?

Future enhancements could include:
- Payment gateway integration
- SMS fallback for OTP
- Real-time tracking dashboard
- Mobile app notifications
- Advanced analytics and reports
- Multi-language support

---

**Built with ❤️ for KsheerMitra - Smart Milk Delivery System**
