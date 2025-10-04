# Enhanced Features Documentation

This document describes the new enhanced features for subscriptions, products, and orders.

---

## Enhanced Product Features

### Product Listing with Pagination and Filtering

**GET /products**

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `category` (optional): Filter by category
- `active` (optional): Filter active products only (true/false)

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Full Cream Milk",
        "description": "Fresh full cream milk",
        "unit_price": 50.00,
        "unit": "litre",
        "category": "dairy",
        "image_url": "/uploads/products/product-123.jpg",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "totalPages": 2
    }
  }
}
```

---

## Multi-Product Subscriptions

### Create Multi-Product Subscription

**POST /subscriptions**

Create a subscription with multiple products and flexible scheduling.

**Request Body:**
```json
{
  "customer_id": "uuid",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "schedule_type": "weekly",
  "days_of_week": "[\"Mon\", \"Wed\", \"Fri\"]",
  "items": [
    {
      "product_id": "uuid1",
      "quantity": 2
    },
    {
      "product_id": "uuid2",
      "quantity": 1
    }
  ]
}
```

**Schedule Types:**
- `daily`: Every day
- `weekly`: Specific days of the week (requires `days_of_week`)
- `custom`: Custom date range with `start_date` and `end_date`

**Days of Week Format:**
JSON string array: `["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]`

**Response:** 201 Created
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "id": "uuid",
    "customer_id": "uuid",
    "product_id": null,
    "quantity_per_day": 0,
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "schedule_type": "weekly",
    "days_of_week": "[\"Mon\", \"Wed\", \"Fri\"]",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "items": [
      {
        "id": "uuid",
        "subscription_id": "uuid",
        "product_id": "uuid1",
        "product_name": "Full Cream Milk",
        "quantity": 2,
        "price_per_unit": 50.00,
        "unit": "litre"
      },
      {
        "id": "uuid",
        "subscription_id": "uuid",
        "product_id": "uuid2",
        "product_name": "Toned Milk",
        "quantity": 1,
        "price_per_unit": 45.00,
        "unit": "litre"
      }
    ]
  }
}
```

### Get Subscription with Items

**GET /subscriptions/:id**

Returns subscription with all associated items (for multi-product subscriptions).

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "customer_id": "uuid",
    "customer_name": "John Doe",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "schedule_type": "weekly",
    "days_of_week": "[\"Mon\", \"Wed\", \"Fri\"]",
    "is_active": true,
    "items": [
      {
        "id": "uuid",
        "product_id": "uuid1",
        "product_name": "Full Cream Milk",
        "quantity": 2,
        "price_per_unit": 50.00,
        "unit": "litre"
      }
    ]
  }
}
```

### Update Multi-Product Subscription

**PUT /subscriptions/:id**

Update subscription items and schedule.

**Request Body:**
```json
{
  "end_date": "2024-12-31",
  "schedule_type": "daily",
  "days_of_week": null,
  "is_active": true,
  "items": [
    {
      "product_id": "uuid1",
      "quantity": 3
    }
  ]
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Subscription updated successfully",
  "data": {
    "id": "uuid",
    "customer_id": "uuid",
    "end_date": "2024-12-31",
    "schedule_type": "daily",
    "is_active": true,
    "items": [
      {
        "id": "uuid",
        "product_id": "uuid1",
        "product_name": "Full Cream Milk",
        "quantity": 3,
        "price_per_unit": 50.00
      }
    ]
  }
}
```

---

## Legacy Single-Product Subscriptions

The API still supports the legacy single-product subscription format for backward compatibility:

**POST /subscriptions**

```json
{
  "customer_id": "uuid",
  "product_id": "uuid",
  "quantity_per_day": 2,
  "start_date": "2024-01-01",
  "end_date": null
}
```

---

## Subscription Adjustments

### Adjust Specific Date Order

**PUT /subscriptions/:id/adjust-date**

Modify the quantity for a specific date without affecting the rest of the subscription.

**Request Body:**
```json
{
  "date": "2024-01-15",
  "adjustments": [
    {
      "product_id": "uuid1",
      "quantity": 5
    }
  ]
}
```

For single-product subscriptions:
```json
{
  "date": "2024-01-15",
  "adjustments": 5
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Date order adjusted successfully",
  "data": {
    "subscriptionId": "uuid",
    "date": "2024-01-15",
    "adjustments": [...],
    "message": "Daily adjustment recorded. This will override the regular quantity for this specific date."
  }
}
```

### Update Entire Subscription Schedule

**PUT /subscriptions/:id/update-all**

Update the schedule that applies to all future deliveries.

**Request Body:**
```json
{
  "schedule_type": "weekly",
  "days_of_week": "[\"Mon\", \"Wed\", \"Fri\"]",
  "items": [
    {
      "product_id": "uuid1",
      "quantity": 3
    }
  ]
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Subscription schedule updated successfully",
  "data": {
    "id": "uuid",
    "schedule_type": "weekly",
    "days_of_week": "[\"Mon\", \"Wed\", \"Fri\"]",
    "items": [...]
  }
}
```

---

## One-Time Orders

### Create One-Time Order

**POST /orders**

Create a one-time order (like Amazon/Flipkart).

**Request Body:**
```json
{
  "customer_id": "uuid",
  "product_id": "uuid",
  "quantity": 5,
  "order_date": "2024-01-15"
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "uuid",
    "customer_id": "uuid",
    "product_id": "uuid",
    "quantity": 5,
    "order_date": "2024-01-15",
    "status": "pending",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Order Status

**PUT /orders/:id/status**

Update order status (delivery boy or admin only).

**Roles:** `admin`, `delivery_boy`

**Request Body:**
```json
{
  "status": "delivered"
}
```

**Valid Statuses:**
- `pending`: Order placed, awaiting delivery
- `delivered`: Order delivered successfully
- `cancelled`: Order cancelled

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "id": "uuid",
    "customer_id": "uuid",
    "product_id": "uuid",
    "quantity": 5,
    "order_date": "2024-01-15",
    "status": "delivered",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

### Get Customer Orders

**GET /customers/:customerId/orders**

Get all orders for a customer with optional month filter.

**Query Parameters:**
- `month` (optional): Filter by month (format: YYYY-MM)

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
      "unit_price": 50.00,
      "quantity": 5,
      "order_date": "2024-01-15",
      "status": "delivered",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

---

## Summary of Key Features

### For Customers:
1. **Browse Products**: Paginated product listing with images and categories
2. **Multi-Product Subscriptions**: Subscribe to multiple products in one subscription
3. **Flexible Scheduling**: Daily, weekly, or custom schedules
4. **Edit Orders**: Change specific date quantities or entire subscription
5. **One-Time Orders**: Place orders like on e-commerce platforms

### For Admin:
1. **User Management**: View, update, and deactivate users
2. **Delivery Boy Management**: Monitor and update delivery boy status
3. **Product Management**: CRUD operations with image upload
4. **Delivery Assignment**: Assign deliveries to delivery boy
5. **Dashboard**: View system statistics

### For Delivery Boy:
1. **Update Order Status**: Mark orders as delivered or cancelled
2. **View Assigned Deliveries**: See all assigned deliveries
3. **Track Status**: System tracks delivery boy availability

### Payment:
- All payments are **offline** (cash on delivery)
- Customer pays the delivery boy upon delivery
- Order status is updated after payment received
