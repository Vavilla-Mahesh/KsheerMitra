# KsheerMitra Test Plan

This document outlines comprehensive testing scenarios for the enhanced KsheerMitra application.

## Prerequisites

- Backend server running on `http://localhost:3000`
- PostgreSQL database with schema applied
- Flutter app connected to backend
- Admin and delivery boy users auto-created on startup

## Backend API Tests

### 1. System User Initialization

**Test Case 1.1: Admin User Auto-Creation**
- Start the backend server
- Check server logs for: `Admin user created: admin@shirmitra.com`
- Expected: Admin user exists in database with role 'admin'

**Test Case 1.2: Delivery Boy Auto-Creation**
- Start the backend server (first time)
- Check server logs for: `Delivery boy user created: delivery@shirmitra.com`
- Expected: Delivery boy user exists with role 'delivery_boy'

**Test Case 1.3: Prevent Duplicate Creation**
- Restart the backend server
- Check server logs for: `Admin user already exists` and `Delivery boy user already exists`
- Expected: No duplicate users created

### 2. Authentication Tests

**Test Case 2.1: Customer Signup**
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer",
    "phone": "9876543210",
    "email": "customer@test.com",
    "location": "123 Test Street",
    "password": "testpass123"
  }'
```
Expected Response:
- Status: 201
- Success: true
- Data contains: user, accessToken, refreshToken
- User role: "customer"

**Test Case 2.2: Reject Admin Signup**
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fake Admin",
    "phone": "1234567890",
    "email": "fakeadmin@test.com",
    "location": "Fake Location",
    "password": "testpass123",
    "role": "admin"
  }'
```
Expected Response:
- Status: 400
- Success: false
- Message: Validation error (role must be 'customer')

**Test Case 2.3: Admin Login**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@shirmitra.com",
    "password": "AdminPass123"
  }'
```
Expected Response:
- Status: 200
- Success: true
- Data contains: user (with role "admin"), accessToken, refreshToken

**Test Case 2.4: Delivery Boy Login**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "delivery@shirmitra.com",
    "password": "DeliveryPass123"
  }'
```
Expected Response:
- Status: 200
- User role: "delivery_boy"

**Test Case 2.5: Invalid Credentials**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@shirmitra.com",
    "password": "WrongPassword"
  }'
```
Expected Response:
- Status: 401
- Success: false
- Message: "Invalid credentials"

**Test Case 2.6: Token Refresh**
```bash
# First login to get refresh token
REFRESH_TOKEN="<token_from_login>"

curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"
```
Expected Response:
- Status: 200
- New accessToken and refreshToken

**Test Case 2.7: Logout**
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"
```
Expected Response:
- Status: 200
- Success: true
- Refresh token revoked in database

### 3. Product Management Tests (Admin Only)

**Test Case 3.1: Create Product**
```bash
ACCESS_TOKEN="<admin_access_token>"

curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "name": "Full Cream Milk",
    "description": "Fresh full cream milk",
    "unit_price": 60,
    "unit": "liter",
    "is_active": true
  }'
```
Expected Response:
- Status: 201
- Product created with UUID

**Test Case 3.2: List All Products**
```bash
curl http://localhost:3000/products \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```
Expected Response:
- Status: 200
- Array of products

**Test Case 3.3: Update Product**
```bash
PRODUCT_ID="<product_uuid>"

curl -X PUT http://localhost:3000/products/$PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "unit_price": 65,
    "is_active": true
  }'
```
Expected Response:
- Status: 200
- Updated product data

**Test Case 3.4: Delete Product**
```bash
curl -X DELETE http://localhost:3000/products/$PRODUCT_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```
Expected Response:
- Status: 200
- Success: true

**Test Case 3.5: Customer Cannot Create Product**
```bash
CUSTOMER_TOKEN="<customer_access_token>"

curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{
    "name": "Unauthorized Product",
    "unit_price": 50,
    "unit": "liter"
  }'
```
Expected Response:
- Status: 403
- Forbidden

### 4. Subscription Management Tests

**Test Case 4.1: Create Subscription (Customer)**
```bash
CUSTOMER_TOKEN="<customer_access_token>"
CUSTOMER_ID="<customer_uuid>"
PRODUCT_ID="<product_uuid>"

curl -X POST http://localhost:3000/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d "{
    \"customer_id\": \"$CUSTOMER_ID\",
    \"product_id\": \"$PRODUCT_ID\",
    \"quantity_per_day\": 2,
    \"start_date\": \"2024-01-01\",
    \"end_date\": null
  }"
```
Expected Response:
- Status: 201
- Subscription created

**Test Case 4.2: Get Customer Subscriptions**
```bash
curl http://localhost:3000/customers/$CUSTOMER_ID/subscriptions \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"
```
Expected Response:
- Status: 200
- Array of customer subscriptions with product details

**Test Case 4.3: Update Subscription**
```bash
SUBSCRIPTION_ID="<subscription_uuid>"

curl -X PUT http://localhost:3000/subscriptions/$SUBSCRIPTION_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{
    "quantity_per_day": 3,
    "is_active": true
  }'
```
Expected Response:
- Status: 200
- Updated subscription

**Test Case 4.4: Cancel Subscription**
```bash
curl -X DELETE http://localhost:3000/subscriptions/$SUBSCRIPTION_ID \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"
```
Expected Response:
- Status: 200
- Subscription deleted

## Flutter App Tests

### 5. Customer Flow Tests

**Test Case 5.1: Customer Signup Flow**
1. Open app (should show login screen)
2. Tap "Sign Up"
3. Fill in all fields:
   - Name: "Test Customer"
   - Phone: "9876543210"
   - Email: "newcustomer@test.com"
   - Location: "Test Address"
   - Password: "testpass123"
4. Submit

Expected Result:
- Automatically logged in
- Navigated to Customer Home Screen
- Products tab shown first
- User profile accessible from top-right

**Test Case 5.2: Browse Products**
1. Login as customer
2. On Products tab (default)
3. Should see list of active products
4. Each product shows: name, description, price per unit

Expected Result:
- Products loaded from backend
- Pull-to-refresh works
- Subscribe button visible on each product

**Test Case 5.3: Create Subscription**
1. On Products tab
2. Tap "Subscribe" on a product
3. Dialog opens
4. Set daily quantity: 2
5. Set start date: Tomorrow
6. Leave end date empty (ongoing)
7. Confirm

Expected Result:
- Subscription created
- Success message shown
- Can view in Subscriptions tab

**Test Case 5.4: Edit Subscription**
1. Go to Subscriptions tab
2. Tap menu (⋮) on a subscription
3. Select "Edit"
4. Change quantity to 3
5. Set end date: 30 days from now
6. Save

Expected Result:
- Subscription updated
- Changes reflected immediately

**Test Case 5.5: Cancel Subscription**
1. On Subscriptions tab
2. Tap menu (⋮) on a subscription
3. Select "Cancel Subscription"
4. Confirm

Expected Result:
- Confirmation dialog shown
- Subscription removed from list
- Success message displayed

**Test Case 5.6: Logout**
1. Tap profile icon (top-right)
2. Tap logout icon
3. Confirm

Expected Result:
- Returned to login screen
- Tokens cleared
- Cannot access protected screens

### 6. Admin Flow Tests

**Test Case 6.1: Admin Login**
1. On login screen
2. Email: admin@shirmitra.com
3. Password: AdminPass123
4. Submit

Expected Result:
- Logged in successfully
- Admin Dashboard shown
- Three tabs: Products, Users, Deliveries

**Test Case 6.2: Add Product**
1. Login as admin
2. On Products tab
3. Tap + (FAB)
4. Fill in:
   - Name: "Toned Milk"
   - Description: "Low fat milk"
   - Price: 55
   - Unit: "liter"
   - Active: ON
5. Save

Expected Result:
- Product created
- Appears in product list
- Visible to customers

**Test Case 6.3: Edit Product**
1. On Products tab (admin)
2. Tap menu (⋮) on a product
3. Select "Edit"
4. Change price to 60
5. Save

Expected Result:
- Product updated
- New price shown
- Change reflects in customer view

**Test Case 6.4: Delete Product**
1. On Products tab (admin)
2. Tap menu (⋮) on a product
3. Select "Delete"
4. Confirm

Expected Result:
- Confirmation dialog shown
- Product removed
- No longer visible to customers

**Test Case 6.5: Deactivate Product**
1. Edit product
2. Toggle "Active" to OFF
3. Save

Expected Result:
- Product marked inactive
- Hidden from customer product list
- Still visible in admin view

### 7. Delivery Boy Flow Tests

**Test Case 7.1: Delivery Boy Login**
1. On login screen
2. Email: delivery@shirmitra.com
3. Password: DeliveryPass123
4. Submit

Expected Result:
- Logged in successfully
- Delivery Dashboard shown
- List of assigned deliveries

### 8. Persistent Login Tests

**Test Case 8.1: App Restart with Valid Token**
1. Login as any user
2. Close app completely
3. Reopen app

Expected Result:
- User remains logged in
- Navigated to appropriate home screen
- No login screen shown

**Test Case 8.2: Token Expiration Handling**
1. Login
2. Wait 16+ minutes (access token expires)
3. Perform an action (e.g., view products)

Expected Result:
- Access token auto-refreshed
- Action completes successfully
- No logout or error

**Test Case 8.3: Expired Refresh Token**
1. Login
2. Manually revoke refresh token (via database or logout from another device)
3. Try to perform action

Expected Result:
- Redirected to login screen
- Must login again

## Security Tests

**Test Case 9.1: Access Without Token**
```bash
curl http://localhost:3000/products
```
Expected Response:
- Status: 401
- Unauthorized

**Test Case 9.2: Customer Accessing Admin Endpoint**
```bash
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer <customer_token>" \
  -d '{...}'
```
Expected Response:
- Status: 403
- Forbidden

**Test Case 9.3: SQL Injection Attempt**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@shirmitra.com\" OR \"1\"=\"1",
    "password": "anything"
  }'
```
Expected Response:
- Status: 401
- Login fails (parameterized queries protect against injection)

**Test Case 9.4: Password Not Exposed in Response**
- Login or fetch user profile
- Check response JSON

Expected Result:
- password_hash field never present in response
- Only id, name, email, phone, location, role returned

## Performance Tests

**Test Case 10.1: Multiple Products Load**
1. Create 50+ products (admin)
2. View products list (customer)

Expected Result:
- Products load within 2 seconds
- Smooth scrolling
- No memory issues

**Test Case 10.2: Concurrent Subscriptions**
1. Create multiple subscriptions rapidly

Expected Result:
- All subscriptions created successfully
- No race conditions
- Data consistency maintained

## Regression Tests

**Test Case 11.1: Existing Features Still Work**
- Orders functionality
- Billing functionality
- Delivery assignments
- Daily adjustments

Expected Result:
- All existing features function as before
- No breaking changes

## Database Tests

**Test Case 12.1: Unique Email Constraint**
1. Create user with email: test@example.com
2. Try to create another user with same email

Expected Result:
- Second creation fails
- Error message: "Email already registered"

**Test Case 12.2: Delivery Boy Uniqueness**
- Only one delivery boy can exist (already created on startup)
- Partial unique index enforces this at database level

**Test Case 12.3: Subscription Date Validation**
1. Try to create subscription with end_date before start_date

Expected Result:
- Database constraint violation
- Error returned

## Pass/Fail Criteria

### Critical (Must Pass)
- [ ] System users auto-created on startup
- [ ] Only customers can signup
- [ ] Admin can manage products (CRUD)
- [ ] Customers can subscribe to products
- [ ] Customers can edit/cancel subscriptions
- [ ] Role-based access control enforced
- [ ] Tokens properly stored and refreshed
- [ ] Logout clears tokens

### Important (Should Pass)
- [ ] Refresh token rotation
- [ ] SQL injection protection
- [ ] Password hashing (bcrypt)
- [ ] Input validation (Joi)
- [ ] Proper error messages
- [ ] UI feedback (loading, success, errors)

### Nice to Have (May Pass)
- [ ] Performance benchmarks met
- [ ] Smooth animations
- [ ] Offline handling

## Test Results Template

| Test Case | Status | Notes | Date Tested |
|-----------|--------|-------|-------------|
| 1.1 | ⬜ | | |
| 1.2 | ⬜ | | |
| ... | ⬜ | | |

Legend: ✅ Pass | ❌ Fail | ⬜ Not Tested | ⏭️ Skipped
