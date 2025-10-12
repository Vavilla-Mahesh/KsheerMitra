# KsheerMitra Implementation Notes

## Summary of Changes

This document describes the enhancements made to the KsheerMitra milk delivery management system.

## Backend Changes

### 1. Admin and Delivery Boy Auto-Initialization

**Files Modified:**
- `backend/.env.example` - Added environment variables for admin and delivery boy credentials
- `backend/utils/initializeUsers.js` - New module to auto-insert system users on startup
- `backend/server.js` - Added call to `initializeSystemUsers()` after DB connection

**How It Works:**
- Admin and delivery boy credentials are defined in environment variables:
  ```
  ADMIN_EMAIL=admin@shirmitra.com
  ADMIN_PASSWORD=AdminPass123
  ADMIN_NAME=Admin
  ADMIN_PHONE=0000000000
  ADMIN_LOCATION=HQ
  
  DELIVERY_EMAIL=delivery@shirmitra.com
  DELIVERY_PASSWORD=DeliveryPass123
  DELIVERY_NAME=DeliveryBoy
  DELIVERY_PHONE=1111111111
  DELIVERY_LOCATION=Warehouse
  ```
- On backend startup, the system checks if users with these emails exist
- If not found, creates them with hashed passwords (bcrypt cost factor 12)
- Prevents duplicate creation on subsequent startups

### 2. Signup Restrictions

**Files Modified:**
- `backend/utils/validation.js` - Changed signup schema to only allow 'customer' role
- `backend/services/authService.js` - Added validation to reject non-customer signup attempts

**Result:**
- Only customers can sign up through the normal signup flow
- Admin and delivery boy accounts can only exist via environment variables

### 3. Product and Subscription Routes

**Verification:**
All CRUD routes are properly configured:

**Products:**
- `GET /products` - List all products (authenticated)
- `POST /products` - Create product (admin only)
- `PUT /products/:id` - Update product (admin only)
- `DELETE /products/:id` - Delete product (admin only)

**Subscriptions:**
- `POST /subscriptions` - Create subscription (customer/admin)
- `GET /subscriptions/:id` - Get subscription details (authenticated)
- `PUT /subscriptions/:id` - Update subscription (customer/admin)
- `DELETE /subscriptions/:id` - Cancel subscription (customer/admin)
- `GET /customers/:customerId/subscriptions` - Get customer's subscriptions

## Flutter App Changes

### 1. Customer Products Screen

**File:** `flutter_app/lib/screens/customer/products_screen.dart` (NEW)

**Features:**
- Displays all active products from backend
- Subscribe button for each product
- Subscription dialog with:
  - Daily quantity input
  - Start date picker
  - Optional end date picker
- Full API integration for creating subscriptions
- Pull-to-refresh support
- Error handling with retry

### 2. Enhanced Subscriptions Screen

**File:** `flutter_app/lib/screens/customer/subscriptions_screen.dart` (MODIFIED)

**New Features:**
- Edit subscription (quantity, active status, end date)
- Cancel subscription with confirmation
- Full API integration for update and delete operations
- Improved UI with action menu

### 3. Admin Products Management

**File:** `flutter_app/lib/screens/admin/products_screen.dart` (MODIFIED)

**New Features:**
- Add new product dialog
- Edit existing product
- Delete product with confirmation
- Full CRUD operations with API integration
- Form validation

### 4. Customer Home Screen

**File:** `flutter_app/lib/screens/customer/customer_home_screen.dart` (MODIFIED)

**Changes:**
- Added "Products" as the first tab
- Reordered navigation: Products → Subscriptions → Orders → Billing
- Customers now see products first after login

## Navigation Flow

### After Signup/Login:
1. **Customer** → Products/Subscriptions screen
2. **Admin** → Admin Dashboard (Products, Users, Deliveries tabs)
3. **Delivery Boy** → Delivery Dashboard (Assigned deliveries)

### Auto-Login After Signup:
- Signup endpoint returns both `accessToken` and `refreshToken`
- Flutter auth service automatically saves tokens
- User is immediately logged in and navigated to role-specific home

## Security Features Maintained

1. **Password Hashing:** bcrypt with cost factor 12 (configurable via BCRYPT_ROUNDS env var)
2. **JWT Tokens:**
   - Access token: 15 minutes expiry
   - Refresh token: 30 days expiry
3. **Token Rotation:** Refresh tokens are rotated on use
4. **Secure Storage:** Flutter app uses `flutter_secure_storage` for tokens
5. **Input Validation:** Joi schemas validate all inputs
6. **Parameterized Queries:** All database queries use parameterized statements

## Database Schema

The schema already includes all required fields and indexes:

### Users Table:
- `id` (UUID, primary key)
- `name`, `phone`, `email`, `location`
- `password_hash` (never exposed in API responses)
- `role` (admin, customer, delivery_boy)
- `created_at`, `updated_at`
- Unique index on `email`
- Partial unique index ensuring only one `delivery_boy` role

### Products Table:
- `id` (UUID, primary key)
- `name`, `description`, `unit_price`, `unit`
- `is_active` (boolean)
- `created_at`, `updated_at`

### Subscriptions Table:
- `id` (UUID, primary key)
- `customer_id`, `product_id` (foreign keys)
- `quantity_per_day` (integer)
- `start_date`, `end_date` (nullable if active)
- `is_active` (boolean)
- `created_at`, `updated_at`

## Testing Recommendations

### Backend Testing:
1. Start PostgreSQL database
2. Copy `.env.example` to `.env` and configure database credentials
3. Run migrations: Apply `backend/migrations/001_initial_schema.sql`
4. Start server: `npm start`
5. Verify admin and delivery users are created on startup
6. Test endpoints using tools like Postman or curl

### Flutter Testing:
1. Ensure backend is running
2. Update `API_BASE_URL` in build configuration if needed
3. Run app: `flutter run`
4. Test flows:
   - Signup as customer → Should auto-login and show Products screen
   - Login as admin → Should show Admin Dashboard
   - Create/edit/delete products (admin)
   - Subscribe to products (customer)
   - Edit/cancel subscriptions (customer)

## API Documentation

All endpoints follow REST conventions and return JSON with this structure:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

## Environment Variables Required

Create a `.env` file in the `backend` directory with these variables:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=ksheer_mitra

# JWT
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# Security
BCRYPT_ROUNDS=12

# CORS
CORS_ORIGIN=http://localhost:3000

# Admin Credentials
ADMIN_EMAIL=admin@shirmitra.com
ADMIN_PASSWORD=AdminPass123
ADMIN_NAME=Admin
ADMIN_PHONE=0000000000
ADMIN_LOCATION=HQ

# Delivery Boy Credentials
DELIVERY_EMAIL=delivery@shirmitra.com
DELIVERY_PASSWORD=DeliveryPass123
DELIVERY_NAME=DeliveryBoy
DELIVERY_PHONE=1111111111
DELIVERY_LOCATION=Warehouse
```

## Notes

- All code uses ES6 modules (`import`/`export`)
- Database connection uses `pg` Client (not Pool) as per requirements
- No demo data or placeholders - all data comes from database
- Token refresh is handled automatically by the Flutter app's API service
- Logout properly revokes refresh tokens
- All routes are protected with JWT authentication
- Role-based access control is enforced at the route level
