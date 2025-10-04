# KsheerMitra API Documentation

Base URL: `http://localhost:3000` (default)

## Table of Contents
- [Authentication](#authentication)
- [Users](#users)
- [Products](#products)
- [Subscriptions](#subscriptions)
- [Daily Adjustments](#daily-adjustments)
- [Orders](#orders)
- [Deliveries](#deliveries)
- [Billing](#billing)
- [System](#system)

## Authentication

All authenticated endpoints require `Authorization: Bearer <access_token>` header.

### POST /auth/signup

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "1234567890",
  "email": "john@example.com",
  "location": "123 Main St, City",
  "password": "password123",
  "role": "customer"
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "phone": "1234567890",
      "email": "john@example.com",
      "location": "123 Main St, City",
      "role": "customer",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### POST /auth/login

Login with email and password.

**Rate Limited:** 5 requests per 15 minutes

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### POST /auth/refresh

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Tokens refreshed successfully",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### POST /auth/logout

Logout and revoke refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Users

### GET /users/me

Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "1234567890",
    "email": "john@example.com",
    "location": "123 Main St, City",
    "role": "customer",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /users/me

Update current user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Smith",
  "phone": "9876543210",
  "location": "456 New St, City"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid",
    "name": "John Smith",
    "phone": "9876543210",
    "email": "john@example.com",
    "location": "456 New St, City",
    "role": "customer",
    "updated_at": "2024-01-02T00:00:00.000Z"
  }
}
```

---

## Products

**Note:** Create, Update, Delete require admin role.

### GET /products

List all products.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `active` (optional): "true" to filter active products only

**Response:** 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Full Cream Milk",
      "description": "Rich and creamy",
      "unit_price": 60.00,
      "unit": "liter",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /products/:id

Get product by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:** 200 OK

### POST /products

Create new product (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Toned Milk",
  "description": "Low fat milk",
  "unit_price": 50.00,
  "unit": "liter",
  "is_active": true
}
```

**Response:** 201 Created

### PUT /products/:id

Update product (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "unit_price": 55.00,
  "is_active": true
}
```

**Response:** 200 OK

### DELETE /products/:id

Delete product (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:** 200 OK

---

## Subscriptions

### POST /subscriptions

Create new subscription.

**Headers:** `Authorization: Bearer <token>`

**Roles:** admin, customer

**Request Body:**
```json
{
  "customer_id": "uuid",
  "product_id": "uuid",
  "quantity_per_day": 2,
  "start_date": "2024-01-01",
  "end_date": null
}
```

**Response:** 201 Created

### GET /subscriptions/:id

Get subscription by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:** 200 OK

### PUT /subscriptions/:id

Update subscription.

**Headers:** `Authorization: Bearer <token>`

**Roles:** admin, customer

**Request Body:**
```json
{
  "quantity_per_day": 3,
  "end_date": "2024-12-31",
  "is_active": true
}
```

**Response:** 200 OK

### DELETE /subscriptions/:id

Cancel subscription.

**Headers:** `Authorization: Bearer <token>`

**Roles:** admin, customer

**Response:** 200 OK

### GET /customers/:customerId/subscriptions

Get all subscriptions for a customer.

**Headers:** `Authorization: Bearer <token>`

**Response:** 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "customer_id": "uuid",
      "product_id": "uuid",
      "product_name": "Full Cream Milk",
      "unit_price": 60.00,
      "quantity_per_day": 2,
      "start_date": "2024-01-01",
      "end_date": null,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Daily Adjustments

### POST /subscriptions/:subscriptionId/adjustments

Create or update daily adjustment for a specific date.

**Headers:** `Authorization: Bearer <token>`

**Roles:** admin, customer

**Request Body:**
```json
{
  "adjustment_date": "2024-01-15",
  "adjusted_quantity": 3
}
```

**Response:** 201 Created

### GET /subscriptions/:subscriptionId/adjustments

Get adjustments for a subscription.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `month` (optional): "YYYY-MM" format to filter by month

**Response:** 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "subscription_id": "uuid",
      "adjustment_date": "2024-01-15",
      "adjusted_quantity": 3,
      "created_at": "2024-01-10T00:00:00.000Z",
      "updated_at": "2024-01-10T00:00:00.000Z"
    }
  ]
}
```

---

## Orders

### POST /orders

Create one-off order.

**Headers:** `Authorization: Bearer <token>`

**Roles:** admin, customer

**Request Body:**
```json
{
  "customer_id": "uuid",
  "product_id": "uuid",
  "quantity": 5,
  "order_date": "2024-01-20"
}
```

**Response:** 201 Created

### GET /orders/:id

Get order by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:** 200 OK

### GET /customers/:customerId/orders

Get all orders for a customer.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `month` (optional): "YYYY-MM" format to filter by month

**Response:** 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "customer_id": "uuid",
      "product_id": "uuid",
      "product_name": "Full Cream Milk",
      "unit_price": 60.00,
      "quantity": 5,
      "order_date": "2024-01-20",
      "status": "pending",
      "created_at": "2024-01-19T00:00:00.000Z",
      "updated_at": "2024-01-19T00:00:00.000Z"
    }
  ]
}
```

---

## Deliveries

### GET /delivery/assigned

Get deliveries assigned to current delivery boy.

**Headers:** `Authorization: Bearer <token>`

**Role:** delivery_boy

**Query Parameters:**
- `date` (optional): Filter by specific date (YYYY-MM-DD)

**Response:** 200 OK

### GET /delivery/all

Get all deliveries (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Role:** admin

**Query Parameters:**
- `status` (optional): Filter by status
- `date` (optional): Filter by date

**Response:** 200 OK

### GET /delivery/:id

Get delivery by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:** 200 OK

### PUT /delivery/:id/status

Update delivery status.

**Headers:** `Authorization: Bearer <token>`

**Roles:** delivery_boy, admin

**Request Body:**
```json
{
  "status": "delivered",
  "notes": "Delivered successfully"
}
```

**Status Values:** pending, assigned, in_progress, delivered, failed

**Response:** 200 OK

---

## Billing

### GET /customers/:customerId/billing

Get monthly billing with daily breakdown.

**Headers:** `Authorization: Bearer <token>`

**Roles:** admin, customer

**Query Parameters:**
- `month` (required): "YYYY-MM" format

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "customer_id": "uuid",
    "customer_name": "John Doe",
    "month": "2024-01",
    "daily_breakdown": [
      {
        "date": "2024-01-01",
        "items": [
          {
            "product_id": "uuid",
            "product_name": "Full Cream Milk",
            "unit_price": 60.00,
            "quantity": 2,
            "line_total": 120.00
          }
        ],
        "day_total": 120.00
      }
    ],
    "month_total": 3600.00
  }
}
```

**Billing Calculation:**
1. For each date in the month:
   - Get active subscriptions
   - Check for daily adjustments (overrides subscription quantity)
   - Add one-off orders
   - Calculate: quantity × unit_price
2. Sum all line totals for month_total

---

## System

### GET /health

Health check endpoint.

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /meta

API metadata.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "name": "KsheerMitra API",
    "version": "1.0.0",
    "description": "Milk Delivery Management System",
    "environment": "development"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["Email is required", "Password must be at least 8 characters"]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many authentication attempts, please try again later"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Authentication Flow

1. **Signup/Login** → Receive access token (15m expiry) and refresh token (30d expiry)
2. **API Requests** → Include `Authorization: Bearer <access_token>` header
3. **Token Expired** → Server returns 401 with `code: "TOKEN_EXPIRED"`
4. **Refresh** → Call `/auth/refresh` with refresh token
5. **New Tokens** → Receive new access and refresh tokens (old refresh token revoked)
6. **Logout** → Call `/auth/logout` to revoke refresh token

## Rate Limiting

- Login endpoint: 5 requests per 15 minutes per IP
- Other endpoints: No rate limiting (add as needed)

## Data Validation

All input data is validated using Joi schemas:
- Email format validation
- Password minimum 8 characters
- Phone number format (10-20 digits)
- UUID format for IDs
- Date format (ISO 8601)
- Number ranges for quantities and prices
