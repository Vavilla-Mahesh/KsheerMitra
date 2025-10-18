# WhatsApp & Google Maps Integration - API Documentation

## Overview

This document describes the new WhatsApp OTP authentication and Google Maps integration features added to KsheerMitra.

## New Dependencies

- **Sequelize**: PostgreSQL ORM for database operations
- **whatsapp-web.js**: WhatsApp messaging automation
- **@googlemaps/google-maps-services-js**: Google Maps API integration
- **pdfkit**: PDF invoice generation
- **node-cron**: Automated task scheduling
- **qrcode-terminal**: Display QR codes for WhatsApp authentication

## Environment Variables

```bash
# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# WhatsApp Configuration
WHATSAPP_SESSION_PATH=./sessions
ENABLE_WHATSAPP=true  # Set to false to disable

# Cron Jobs
ENABLE_CRON=true  # Set to false to disable automated tasks

# JWT Secret
JWT_SECRET=your_secret_key_change_in_production
```

## Authentication Flow

### 1. Request OTP
**POST** `/api/auth/otp/request`

Request body:
```json
{
  "phone": "+919876543210"
}
```

Response:
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otpSentViaWhatsApp": true
}
```

### 2. Verify OTP
**POST** `/api/auth/otp/verify`

Request body:
```json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "name": "User Name",
    "phone": "+919876543210",
    "role": "CUSTOMER",
    "address": "User Address",
    "email": "user@example.com"
  }
}
```

### 3. Update Profile
**PUT** `/api/auth/profile`

Headers:
```
Authorization: Bearer <jwt_token>
```

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "address": "123 Main St, City, State"
}
```

Response:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "+919876543210",
    "role": "CUSTOMER",
    "address": "123 Main St, City, State (geocoded)",
    "email": "john@example.com",
    "latitude": 12.9716,
    "longitude": 77.5946
  }
}
```

### 4. Get Profile
**GET** `/api/auth/profile`

Headers:
```
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "+919876543210",
    "email": "john@example.com",
    "role": "CUSTOMER",
    "address": "123 Main St",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "status": "active"
  }
}
```

## Delivery Boy APIs

All delivery boy routes require authentication with role `DELIVERY`.

### 1. Get Assigned Customers with Route Optimization
**GET** `/api/delivery/assigned-customers?date=2025-10-18`

Headers:
```
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "delivery_status_id",
        "customerId": "customer_uuid",
        "customerName": "Customer Name",
        "customerPhone": "+919876543210",
        "customerAddress": "Customer Address",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "product": "Milk",
        "quantity": 2,
        "price": "50.00",
        "status": "PENDING",
        "date": "2025-10-18"
      }
    ],
    "route": {
      "distance": 5000,
      "distanceText": "5.00 km",
      "duration": 900,
      "durationText": "15 mins",
      "polyline": "encoded_polyline",
      "optimizedCustomerOrder": ["uuid1", "uuid2", "uuid3"],
      "legs": [...]
    }
  }
}
```

### 2. Update Delivery Status
**PUT** `/api/delivery/status/:deliveryStatusId`

Headers:
```
Authorization: Bearer <jwt_token>
```

Request body:
```json
{
  "status": "DELIVERED",
  "notes": "Delivered successfully"
}
```

Status options: `PENDING`, `DELIVERED`, `MISSED`

Response:
```json
{
  "success": true,
  "message": "Delivery status updated successfully",
  "data": {
    "id": "uuid",
    "status": "DELIVERED",
    "date": "2025-10-18"
  }
}
```

**Note**: When status is set to `DELIVERED` or `MISSED`, a WhatsApp notification is automatically sent to the customer.

### 3. Generate Daily Invoice
**POST** `/api/delivery/invoice/daily`

Headers:
```
Authorization: Bearer <jwt_token>
```

Request body:
```json
{
  "date": "2025-10-18"
}
```

Response:
```json
{
  "success": true,
  "message": "Daily invoice generated and sent",
  "data": {
    "invoiceId": "uuid",
    "totalAmount": 500.00,
    "deliveryCount": 10
  }
}
```

**Note**: Invoice PDF is automatically sent to admin via WhatsApp.

### 4. Get Delivery Statistics
**GET** `/api/delivery/stats?startDate=2025-10-01&endDate=2025-10-18`

Headers:
```
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "success": true,
  "data": {
    "total": 100,
    "delivered": 85,
    "missed": 5,
    "pending": 10
  }
}
```

## Admin APIs

All admin routes require authentication with role `ADMIN`.

### 1. Assign Area to Delivery Boy
**POST** `/api/admin/area/assign`

Headers:
```
Authorization: Bearer <jwt_token>
```

Request body:
```json
{
  "deliveryBoyId": "delivery_boy_uuid",
  "areaName": "North Zone",
  "customerIds": ["customer_uuid1", "customer_uuid2", "customer_uuid3"]
}
```

Response:
```json
{
  "success": true,
  "message": "Area assigned successfully",
  "data": {
    "id": "uuid",
    "deliveryBoyId": "delivery_boy_uuid",
    "areaName": "North Zone",
    "customers": ["customer_uuid1", "customer_uuid2"]
  }
}
```

### 2. Get All Area Assignments
**GET** `/api/admin/area/assignments`

Headers:
```
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "areaName": "North Zone",
      "deliveryBoy": {
        "id": "uuid",
        "name": "Delivery Boy Name",
        "phone": "+919876543210"
      },
      "customers": [
        {
          "id": "uuid",
          "name": "Customer Name",
          "phone": "+919876543210",
          "address": "Customer Address"
        }
      ]
    }
  ]
}
```

### 3. Get Dashboard Statistics
**GET** `/api/admin/dashboard/stats`

Headers:
```
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "success": true,
  "data": {
    "totalCustomers": 150,
    "totalProducts": 10,
    "activeSubscriptions": 120,
    "todayDeliveries": 50,
    "deliveredToday": 40,
    "missedToday": 2,
    "pendingToday": 8
  }
}
```

### 4. Get All Invoices
**GET** `/api/admin/invoices?type=DAILY&startDate=2025-10-01&endDate=2025-10-18&page=1&limit=20`

Headers:
```
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": "uuid",
        "type": "DAILY",
        "amount": "500.00",
        "date": "2025-10-18",
        "sentViaWhatsApp": true,
        "pdfPath": "/path/to/invoice.pdf",
        "generator": {
          "id": "uuid",
          "name": "Delivery Boy Name",
          "role": "DELIVERY"
        },
        "targetUser": null
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

### 5. Get All Delivery Statuses
**GET** `/api/admin/delivery-statuses?status=DELIVERED&date=2025-10-18&page=1&limit=50`

Headers:
```
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "success": true,
  "data": {
    "deliveryStatuses": [
      {
        "id": "uuid",
        "date": "2025-10-18",
        "status": "DELIVERED",
        "customer": {
          "id": "uuid",
          "name": "Customer Name",
          "phone": "+919876543210",
          "address": "Customer Address"
        },
        "deliveryBoy": {
          "id": "uuid",
          "name": "Delivery Boy Name",
          "phone": "+919876543210"
        },
        "subscription": {
          "product": {
            "name": "Milk",
            "price": "50.00",
            "unit": "liter"
          }
        }
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 50,
      "totalPages": 2
    }
  }
}
```

### 6. Create Delivery Boy
**POST** `/api/admin/delivery-boys`

Headers:
```
Authorization: Bearer <jwt_token>
```

Request body:
```json
{
  "name": "Delivery Boy Name",
  "phone": "+919876543210",
  "address": "123 Main St, City"
}
```

Response:
```json
{
  "success": true,
  "message": "Delivery boy created successfully",
  "data": {
    "id": "uuid",
    "name": "Delivery Boy Name",
    "phone": "+919876543210",
    "role": "DELIVERY",
    "address": "123 Main St, City (geocoded)",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "status": "active"
  }
}
```

### 7. Get All Delivery Boys
**GET** `/api/admin/delivery-boys`

Headers:
```
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Delivery Boy Name",
      "phone": "+919876543210",
      "address": "123 Main St",
      "latitude": 12.9716,
      "longitude": 77.5946,
      "status": "active",
      "areaAssignments": [
        {
          "id": "uuid",
          "areaName": "North Zone",
          "customers": ["uuid1", "uuid2"]
        }
      ]
    }
  ]
}
```

## WhatsApp Notifications

### Automatic Notifications

1. **OTP Notification**: Sent when user requests OTP
   ```
   Your KsheerMitra OTP is: 123456
   Valid for 10 minutes.
   Do not share this code with anyone.
   ```

2. **Delivery Confirmation**: Sent when delivery is marked as delivered
   ```
   ✅ Your Milk for 2025-10-18 has been delivered!
   
   Thank you for choosing KsheerMitra.
   ```

3. **Delivery Missed**: Sent when delivery is marked as missed
   ```
   ❌ Your Milk for 2025-10-18 was missed.
   
   Please contact us for rescheduling.
   ```

4. **Daily Invoice**: Sent to admin at end of day
   - PDF attachment with delivery summary

5. **Monthly Invoice**: Sent to customers on 1st of month
   - PDF attachment with monthly billing

## Cron Jobs

### Daily Invoice Generation
- **Schedule**: Every day at 8:00 PM
- **Action**: Generate daily invoices for all delivery boys and send to admin via WhatsApp

### Monthly Invoice Generation
- **Schedule**: 1st day of every month at 9:00 AM
- **Action**: Generate monthly invoices for all customers and send via WhatsApp

## Google Maps Integration

### Features

1. **Address Geocoding**: Automatically converts addresses to latitude/longitude
2. **Route Optimization**: Calculates optimal delivery route for delivery boys
3. **Distance Calculation**: Computes distance and estimated time between locations

### Usage in Code

```javascript
import { getGoogleMapsService } from './services/googleMapsService.js';

const mapsService = getGoogleMapsService();

// Geocode an address
const location = await mapsService.geocodeAddress('123 Main St, City');
// Returns: { lat: 12.9716, lng: 77.5946, formattedAddress: '...' }

// Calculate route
const route = await mapsService.calculateRoute([
  { lat: 12.9716, lng: 77.5946 },
  { lat: 12.9800, lng: 77.6000 }
]);

// Get optimized delivery route
const optimizedRoute = await mapsService.getOptimizedDeliveryRoute(
  deliveryBoyLocation,
  customerLocations
);
```

## Database Schema Updates

### New Tables

1. **delivery_status**: Tracks delivery statuses per customer per day
2. **invoices**: Stores generated invoices
3. **area_assignments**: Maps delivery boys to customer areas

### Updated Fields

- **users**: Added `otp`, `otp_expiry`, `latitude`, `longitude`, `area_id`
- **subscriptions**: Added `type` enum

See migration file: `/backend/migrations/004_whatsapp_googlemaps_integration.sql`

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env`:
   ```bash
   cp .env.example .env
   # Edit .env and add your configuration
   ```

3. Run database migrations:
   ```bash
   psql -U postgres -d ksheermitra -f migrations/004_whatsapp_googlemaps_integration.sql
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. If WhatsApp is enabled, scan QR code on first run to authenticate

## Testing

### Test OTP Authentication
```bash
curl -X POST http://localhost:5000/api/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'
```

### Test with Authentication
```bash
# Get JWT token from login response
TOKEN="your_jwt_token"

curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

## Security Considerations

1. **JWT Secret**: Change `JWT_SECRET` in production
2. **OTP Expiry**: OTPs expire after 10 minutes
3. **Rate Limiting**: Consider adding rate limiting for OTP requests
4. **WhatsApp Session**: Session data stored locally in `./sessions`
5. **Google Maps API**: Protect API key and enable billing limits

## Troubleshooting

### WhatsApp Not Working
- Check if `ENABLE_WHATSAPP=true` in `.env`
- Ensure QR code is scanned on first run
- Check session directory permissions

### Google Maps Errors
- Verify `GOOGLE_MAPS_API_KEY` is set
- Check API key has required permissions (Geocoding, Directions)
- Ensure billing is enabled on Google Cloud

### Cron Jobs Not Running
- Check if `ENABLE_CRON=true` in `.env`
- Verify server timezone matches expected schedule
- Check logs for cron execution

## Support

For issues or questions, please refer to the main README or create an issue on GitHub.
