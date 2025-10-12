# Admin API Documentation

This document describes the admin-specific endpoints for the KsheerMitra API.

## Base URL
`http://localhost:3000` (default)

## Authentication
All admin endpoints require:
- `Authorization: Bearer <access_token>` header
- User must have the `admin` role

---

## User Management

### GET /admin/users

Get all users in the system.

**Query Parameters:**
- `role` (optional): Filter by role (`customer`, `delivery_boy`)
- `status` (optional): Filter by status (`active`, `inactive`)

**Response:** 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "phone": "1234567890",
      "email": "john@example.com",
      "location": "123 Main St",
      "role": "customer",
      "status": "active",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### PUT /admin/users/:id

Update user information.

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "phone": "9876543210",
  "location": "456 New St",
  "status": "active"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe Updated",
    "phone": "9876543210",
    "email": "john@example.com",
    "location": "456 New St",
    "role": "customer",
    "status": "active",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### PATCH /admin/users/:id/deactivate

Deactivate a user (cannot deactivate admin users).

**Response:** 200 OK
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "status": "inactive"
  }
}
```

---

## Delivery Boy Management

### GET /admin/delivery-boy

Get delivery boy details with current status.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Delivery Boy Name",
    "phone": "1234567890",
    "email": "delivery@example.com",
    "location": "789 Delivery St",
    "status": "active",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "delivery_status": "available",
    "current_location": "789 Delivery St",
    "status_updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /admin/delivery-boy

Update delivery boy details.

**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "9876543210",
  "location": "New Location",
  "status": "active"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Delivery boy updated successfully",
  "data": {
    "id": "uuid",
    "name": "Updated Name",
    "phone": "9876543210",
    "email": "delivery@example.com",
    "location": "New Location",
    "status": "active",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Delivery Assignment

### POST /admin/assign-delivery

Assign a delivery to the delivery boy for a specific customer.

**Request Body:**
```json
{
  "customer_id": "uuid",
  "delivery_date": "2024-01-15"
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "message": "Delivery assigned successfully",
  "data": {
    "id": "uuid",
    "customer_id": "uuid",
    "delivery_boy_id": "uuid",
    "delivery_date": "2024-01-15",
    "status": "assigned",
    "notes": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Dashboard

### GET /admin/dashboard

Get dashboard statistics.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "activeCustomers": 150,
    "totalProducts": 25,
    "ongoingDeliveries": 45,
    "deliveryBoyStatus": {
      "id": "uuid",
      "name": "Delivery Boy Name",
      "status": "available"
    }
  }
}
```

---

## Product Management with Images

### POST /admin/products

Create a new product with image upload.

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `name` (required): Product name
- `description`: Product description
- `unit_price` (required): Price per unit
- `unit` (required): Unit of measurement (e.g., "litre", "kg")
- `category`: Product category
- `is_active`: true/false (default: true)
- `image`: Image file (max 5MB, JPEG/PNG/GIF/WebP)

**Response:** 201 Created
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "uuid",
    "name": "Product Name",
    "description": "Product description",
    "unit_price": 50.00,
    "unit": "litre",
    "category": "dairy",
    "image_url": "/uploads/products/product-1234567890-123456789.jpg",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /admin/products/:id

Update a product (optionally with new image).

**Content-Type:** `multipart/form-data`

**Form Fields:** (all optional)
- `name`: Product name
- `description`: Product description
- `unit_price`: Price per unit
- `unit`: Unit of measurement
- `category`: Product category
- `is_active`: true/false
- `image`: New image file (max 5MB)

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": "uuid",
    "name": "Updated Product Name",
    "description": "Updated description",
    "unit_price": 55.00,
    "unit": "litre",
    "category": "dairy",
    "image_url": "/uploads/products/product-1234567890-987654321.jpg",
    "is_active": true,
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["Field 'name' is required"]
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

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```
