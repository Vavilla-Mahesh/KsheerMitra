# Flutter Mobile App - Backend API Integration Guide

## Overview

This document provides comprehensive API endpoints for integrating the Flutter mobile app with the Node.js + PostgreSQL backend for KsheerMitra milk delivery management system.

## Base URL

```
http://your-server:5000
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## API Endpoints

### 1. Authentication (OTP-based)

#### Request OTP
```http
POST /api/auth/send-otp
```

**Request Body:**
```json
{
  "phone": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otpSentViaWhatsApp": true
}
```

**Note:** In development, OTP is also logged to console.

---

#### Verify OTP
```http
POST /api/auth/verify-otp
```

**Request Body:**
```json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "+919876543210",
    "role": "CUSTOMER|DELIVERY|ADMIN",
    "address": "123 Main St",
    "email": "john@example.com"
  }
}
```

---

#### Update Profile (Complete Signup)
```http
PUT /api/auth/profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "address": "123 Main Street, City",
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "+919876543210",
    "role": "CUSTOMER",
    "address": "123 Main Street, City",
    "email": "john@example.com",
    "latitude": 12.9716,
    "longitude": 77.5946
  }
}
```

**Note:** 
- Latitude and longitude can be provided directly from Flutter's geolocator
- If only address is provided without lat/lng, backend will attempt to geocode it
- This endpoint can be used for both initial signup and profile updates

---

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

**Response:**
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

---

### 2. Products

#### Get All Products
```http
GET /products
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Full Cream Milk",
      "price": 50,
      "unit": "liter",
      "description": "Fresh full cream milk",
      "image": "/uploads/products/milk.jpg"
    }
  ]
}
```

---

### 3. Subscriptions

#### Create Subscription
```http
POST /subscriptions
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "customerId": "uuid",
  "productId": "uuid",
  "quantity": 2,
  "type": "MONTHLY|CUSTOM|SPECIFIC_DAYS",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "specificDays": [1, 2, 3, 4, 5]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "customerId": "uuid",
    "productId": "uuid",
    "quantity": 2,
    "type": "MONTHLY",
    "active": true
  }
}
```

---

### 4. Delivery Boy Routes

#### Get Assigned Customers with Route
```http
GET /api/delivery/assigned-customers?date=2024-01-15
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "delivery-status-uuid",
        "customerId": "uuid",
        "customerName": "John Doe",
        "customerPhone": "+919876543210",
        "customerAddress": "123 Main St",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "product": "Full Cream Milk",
        "quantity": 2,
        "price": 50,
        "status": "PENDING|DELIVERED|MISSED",
        "date": "2024-01-15"
      }
    ],
    "route": {
      "distance": 5000,
      "distanceText": "5.00 km",
      "duration": 900,
      "durationText": "15 mins",
      "polyline": "encoded_polyline_string",
      "optimizedCustomerOrder": ["uuid1", "uuid2", "uuid3"]
    }
  }
}
```

---

#### Update Delivery Status
```http
PUT /api/delivery/status/:deliveryStatusId
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "DELIVERED|MISSED"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Delivery status updated",
  "whatsappSent": true
}
```

**Note:** Backend automatically sends WhatsApp notification to customer.

---

#### Generate Daily Invoice (End of Day)
```http
POST /api/delivery/invoice/daily
Authorization: Bearer <token>
```

**Request Body (Optional):**
```json
{
  "date": "2024-01-15"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Daily invoice generated successfully",
  "data": {
    "invoice": {
      "id": "uuid",
      "type": "DAILY",
      "amount": 500.00,
      "pdfPath": "/invoices/daily_invoice_xxx.pdf",
      "sentViaWhatsApp": true
    },
    "deliveriesCount": 10,
    "totalAmount": 500.00
  }
}
```

**Note:** 
- Defaults to today if date not provided
- PDF is automatically sent to admin via WhatsApp
- Returns summary of all deliveries for the day

---

#### Get Delivery Statistics
```http
GET /api/delivery/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "today": {
      "total": 10,
      "delivered": 8,
      "missed": 1,
      "pending": 1
    },
    "thisWeek": {
      "total": 70,
      "delivered": 65,
      "missed": 5
    },
    "thisMonth": {
      "total": 300,
      "delivered": 285,
      "missed": 15
    }
  }
}
```

---

### 5. Invoice Routes

#### Generate Monthly Invoice
```http
POST /api/invoice/monthly/:customerId
Authorization: Bearer <token>
```

**Request Body (Optional):**
```json
{
  "month": 1,
  "year": 2024
}
```

**Response:**
```json
{
  "success": true,
  "message": "Monthly invoice generated successfully",
  "data": {
    "invoice": {
      "id": "uuid",
      "type": "MONTHLY",
      "amount": 1500.00,
      "date": "2024-01-01",
      "pdfPath": "/invoices/monthly_invoice_xxx.pdf",
      "sentViaWhatsApp": true
    },
    "deliveriesCount": 30,
    "totalAmount": 1500.00
  }
}
```

**Note:** 
- Defaults to previous month if not specified
- Only includes DELIVERED status deliveries
- PDF is automatically sent to customer via WhatsApp

---

#### Get Customer Invoices
```http
GET /api/invoice/customer/:customerId?type=MONTHLY&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

**Query Parameters:**
- `type` (optional): DAILY or MONTHLY
- `startDate` (optional): Filter start date
- `endDate` (optional): Filter end date

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "generatedBy": "uuid",
      "targetUserId": "uuid",
      "type": "MONTHLY",
      "amount": 1500.00,
      "pdfPath": "/invoices/monthly_invoice_xxx.pdf",
      "sentViaWhatsApp": true,
      "date": "2024-01-01",
      "generator": {
        "id": "uuid",
        "name": "Admin User",
        "role": "ADMIN"
      }
    }
  ]
}
```

---

### 6. Admin Routes

#### Assign Area to Delivery Boy
```http
POST /api/admin/area/assign
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "deliveryBoyId": "uuid",
  "areaName": "Downtown Area",
  "customerIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Area assigned successfully",
  "data": {
    "id": "uuid",
    "deliveryBoyId": "uuid",
    "areaName": "Downtown Area",
    "customers": ["uuid1", "uuid2", "uuid3"]
  }
}
```

---

#### Get Dashboard Statistics
```http
GET /api/admin/dashboard/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCustomers": 100,
    "totalDeliveryBoys": 5,
    "activeSubscriptions": 80,
    "todayDeliveries": {
      "total": 50,
      "delivered": 45,
      "pending": 5,
      "missed": 0
    },
    "revenue": {
      "today": 2500.00,
      "thisMonth": 75000.00
    }
  }
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

- OTP endpoints: 5 requests per 15 minutes
- Auth endpoints: 10 requests per 15 minutes
- Delivery endpoints: 30 requests per minute
- Admin endpoints: 60 requests per minute
- Invoice endpoints: 10 requests per minute

---

## WhatsApp Integration

The backend automatically sends WhatsApp messages for:
1. **OTP verification** - When user requests OTP
2. **Delivery notifications** - When delivery boy marks status
3. **Daily invoices** - Sent to admin at end of day
4. **Monthly invoices** - Sent to customers on generation

---

## Google Maps Integration

The backend uses Google Maps API for:
1. **Geocoding** - Convert addresses to lat/lng
2. **Route optimization** - Calculate best delivery route
3. **Distance calculation** - Estimate delivery times

Set `GOOGLE_MAPS_API_KEY` in environment variables.

---

## Environment Variables

Required environment variables for backend:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=*

# Database
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_password
PG_DATABASE=ksheermitra

# JWT
JWT_SECRET=your_secret_key

# Google Maps
GOOGLE_MAPS_API_KEY=your_api_key

# WhatsApp
WHATSAPP_SESSION_PATH=./sessions
ENABLE_WHATSAPP=true

# Cron Jobs
ENABLE_CRON=true
```

---

## Flutter Package Requirements

Add these to `pubspec.yaml`:

```yaml
dependencies:
  flutter_riverpod: ^2.4.9
  dio: ^5.4.0
  flutter_secure_storage: ^9.0.0
  google_maps_flutter: ^2.2.7
  geolocator: ^9.0.2
  google_place: ^0.4.7
  geocoding: ^2.1.0
  intl: ^0.18.1
```

---

## Complete Integration Flow

### For Customers:

1. **Login/Signup**
   - Request OTP → `/api/auth/send-otp`
   - Verify OTP → `/api/auth/verify-otp`
   - Complete profile → `/api/auth/profile`

2. **Subscribe to Products**
   - View products → `/products`
   - Create subscription → `/subscriptions`

3. **View Orders & Invoices**
   - View invoices → `/api/invoice/customer/:customerId`

### For Delivery Boys:

1. **Login**
   - Request OTP → `/api/auth/send-otp`
   - Verify OTP → `/api/auth/verify-otp`

2. **Daily Operations**
   - View assigned customers → `/api/delivery/assigned-customers`
   - Update delivery status → `/api/delivery/status/:id`
   - End of day → `/api/delivery/invoice/daily`

### For Admins:

1. **Dashboard**
   - View statistics → `/api/admin/dashboard/stats`

2. **Manage Assignments**
   - Assign areas → `/api/admin/area/assign`

3. **Generate Invoices**
   - Monthly invoices → `/api/invoice/monthly/:customerId`
   - View all invoices → `/api/invoice/customer/:customerId`

---

## Testing

Use Postman or curl to test endpoints:

```bash
# Request OTP
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'

# Verify OTP
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "otp": "123456"}'
```

---

## Support

For issues or questions, refer to:
- Backend README: `/backend/README.md`
- API Documentation: `/backend/WHATSAPP_GOOGLEMAPS_API_DOCS.md`
- Integration Guide: `/backend/INTEGRATION_SETUP_GUIDE.md`
