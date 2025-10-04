# Testing Checklist for KsheerMitra Fixes

This document provides a comprehensive testing checklist for all implemented features.

## Prerequisites
- Backend server running (Node.js + PostgreSQL)
- Flutter app compiled and installed
- Test user accounts (admin and customer)
- Sample products in database

---

## 1. Image Upload for Products

### Backend Testing

#### Test 1.1: Upload Image with New Product
- [ ] **Endpoint**: POST `/products`
- [ ] **Headers**: Authorization Bearer token (admin)
- [ ] **Body**: Form-data with:
  - `name`: Test Product
  - `description`: Test description
  - `unit_price`: 100.00
  - `unit`: liter
  - `image`: Select JPEG file (< 5MB)
- [ ] **Expected Result**: 
  - Status 201
  - Response includes `image_url` field
  - File exists in `backend/uploads/products/`

#### Test 1.2: Upload PNG Image
- [ ] Repeat Test 1.1 with PNG image
- [ ] Verify file is saved and returned in response

#### Test 1.3: Upload WebP Image
- [ ] Repeat Test 1.1 with WebP image
- [ ] Verify file is saved and returned in response

#### Test 1.4: Invalid File Type (PDF)
- [ ] Upload PDF file instead of image
- [ ] **Expected Result**: Status 400 with error message

#### Test 1.5: File Too Large (> 5MB)
- [ ] Upload image larger than 5MB
- [ ] **Expected Result**: Status 400 with "File too large" message

#### Test 1.6: Get Product with Image
- [ ] **Endpoint**: GET `/products`
- [ ] **Expected Result**: Products with `image_url` field containing full path

#### Test 1.7: Update Product Image
- [ ] **Endpoint**: PUT `/products/:id`
- [ ] Upload new image for existing product
- [ ] Verify old image is replaced

### Frontend Testing

#### Test 1.8: Display Product Image
- [ ] Open Products screen (customer)
- [ ] Verify images load correctly
- [ ] Verify placeholder shows for products without images

#### Test 1.9: Image Load Error
- [ ] Modify image URL to invalid path
- [ ] Verify error placeholder icon displays

#### Test 1.10: Product Details Dialog
- [ ] Tap on product card
- [ ] Verify image displays in detail view
- [ ] Verify error handling for missing images

---

## 2. Product Screen Overflow Fix

### UI Testing

#### Test 2.1: Grid Layout on Different Screen Sizes
- [ ] Test on small phone (< 5 inches)
- [ ] Test on medium phone (5-6 inches)
- [ ] Test on large phone (> 6 inches)
- [ ] Test on tablet
- [ ] **Expected**: No text overflow, buttons visible

#### Test 2.2: Long Product Names
- [ ] Create product with very long name (50+ characters)
- [ ] Verify name truncates with ellipsis
- [ ] Verify card doesn't overflow

#### Test 2.3: Scrolling Performance
- [ ] Add 20+ products
- [ ] Scroll through grid
- [ ] **Expected**: Smooth scrolling with BouncingScrollPhysics
- [ ] No lag or stuttering

#### Test 2.4: Button Layout
- [ ] Verify "Order" and "Cart" buttons fit side by side
- [ ] Tap each button to verify they're responsive
- [ ] Verify buttons don't clip or overlap

#### Test 2.5: Image Aspect Ratio
- [ ] Upload images with different aspect ratios (square, portrait, landscape)
- [ ] Verify all images display correctly without distortion
- [ ] Verify grid maintains consistent layout

---

## 3. Multi-Product Subscriptions

### Backend Testing

#### Test 3.1: Create Multi-Product Subscription
- [ ] **Endpoint**: POST `/subscriptions`
- [ ] **Body**:
```json
{
  "customer_id": "customer-uuid",
  "start_date": "2025-10-05",
  "schedule_type": "daily",
  "items": [
    {"product_id": "product1-uuid", "quantity": 2},
    {"product_id": "product2-uuid", "quantity": 1}
  ]
}
```
- [ ] **Expected**: Status 201, subscription created with items

#### Test 3.2: Create Weekly Schedule Subscription
- [ ] Similar to 3.1 but with:
```json
{
  "schedule_type": "weekly",
  "days_of_week": "Monday,Wednesday,Friday"
}
```
- [ ] **Expected**: Subscription created with schedule info

#### Test 3.3: Create with End Date
- [ ] Add `end_date` field to request
- [ ] **Expected**: Subscription created with end date

#### Test 3.4: Get Multi-Product Subscription
- [ ] **Endpoint**: GET `/subscriptions/:id`
- [ ] **Expected**: Response includes `items` array with product details

#### Test 3.5: Get Customer Subscriptions
- [ ] **Endpoint**: GET `/customers/:customerId/subscriptions`
- [ ] Create both single and multi-product subscriptions
- [ ] **Expected**: Both types returned correctly with appropriate fields

#### Test 3.6: Validation - No Products
- [ ] POST subscription without `product_id` or `items`
- [ ] **Expected**: Status 400, validation error

#### Test 3.7: Validation - Invalid Product ID
- [ ] POST subscription with non-existent product ID in items
- [ ] **Expected**: Status 400, "Product not found" error

### Frontend Testing

#### Test 3.8: Open Create Subscription Screen
- [ ] Navigate to Subscriptions tab
- [ ] Tap "Create Subscription" FAB
- [ ] **Expected**: Navigation to creation screen

#### Test 3.9: Add Single Product
- [ ] Tap on a product from the list
- [ ] Enter quantity in dialog
- [ ] Tap "Add"
- [ ] **Expected**: Product appears in "Selected Products" section

#### Test 3.10: Add Multiple Products
- [ ] Add 3-5 different products
- [ ] Verify all appear in selected list
- [ ] Verify each shows quantity and price

#### Test 3.11: Edit Product Quantity
- [ ] Tap edit icon on selected product
- [ ] Change quantity
- [ ] **Expected**: Quantity updates in list

#### Test 3.12: Remove Product
- [ ] Tap delete icon on selected product
- [ ] **Expected**: Product removed from selection

#### Test 3.13: Select Daily Schedule
- [ ] Choose "Every Day" from dropdown
- [ ] **Expected**: No day selection chips shown

#### Test 3.14: Select Weekly Schedule
- [ ] Choose "Specific Days" from dropdown
- [ ] **Expected**: Day chips appear
- [ ] Tap multiple days (e.g., Mon, Wed, Fri)
- [ ] Verify selected days are highlighted

#### Test 3.15: Set Start Date
- [ ] Tap on Start Date
- [ ] Select date from picker
- [ ] **Expected**: Date updates in UI

#### Test 3.16: Set End Date
- [ ] Tap on End Date
- [ ] Select date after start date
- [ ] **Expected**: Date updates in UI

#### Test 3.17: Clear End Date
- [ ] Set end date
- [ ] Tap X icon to clear
- [ ] **Expected**: Shows "No end date"

#### Test 3.18: Save Subscription
- [ ] Complete all fields
- [ ] Tap "Save Subscription"
- [ ] **Expected**: 
  - Loading indicator shows
  - Success message appears
  - Returns to subscriptions list
  - New subscription visible

#### Test 3.19: Validation - No Products Selected
- [ ] Try to save without selecting products
- [ ] **Expected**: Error message "Please select at least one product"

#### Test 3.20: Validation - Weekly with No Days
- [ ] Select weekly schedule
- [ ] Don't select any days
- [ ] Try to save
- [ ] **Expected**: Error message

#### Test 3.21: Display Multi-Product Subscription
- [ ] View subscriptions list
- [ ] **Expected**: Multi-product subscription shows:
  - "Multi-Product Subscription" title
  - Number of products
  - Expandable items list
  - Schedule type

#### Test 3.22: View Subscription Details
- [ ] Tap menu on multi-product subscription
- [ ] Select "View Details"
- [ ] **Expected**: Dialog shows all products, quantities, prices, schedule

#### Test 3.23: Single-Product Backward Compatibility
- [ ] Create old-style single-product subscription
- [ ] Verify it displays correctly
- [ ] Verify edit/adjust options work

---

## 4. Product Card Button Logic

### Frontend Testing

#### Test 4.1: Verify Button Layout
- [ ] Open Products screen
- [ ] **Expected**: Each product card shows:
  - "Order" button (outlined)
  - "Cart" button (filled)
  - NO "Subscribe" button

#### Test 4.2: Order Button Functionality
- [ ] Tap "Order" button on a product
- [ ] **Expected**: Dialog opens with:
  - Quantity field
  - Date picker
  - "Order Now" button

#### Test 4.3: Place Order
- [ ] In order dialog:
  - Enter quantity: 2
  - Select date: Tomorrow
  - Tap "Order Now"
- [ ] **Expected**: Success message "Order placed successfully!"

#### Test 4.4: Order Validation
- [ ] Try to order with quantity 0 or negative
- [ ] **Expected**: Error message "Please enter a valid quantity"

#### Test 4.5: Cart Button
- [ ] Tap "Cart" button
- [ ] **Expected**: Toast message "Add to Cart feature - Coming soon!"

#### Test 4.6: Product Details - Subscribe Option
- [ ] Tap on product card to open details
- [ ] **Expected**: "Subscribe" button still available in details view
- [ ] Subscribe button should create single-product subscription

---

## 5. Subscription Screen Workflow

### Frontend Testing

#### Test 5.1: FAB Visibility
- [ ] Open Subscriptions screen
- [ ] **Expected**: Floating Action Button visible at bottom-right
- [ ] Label reads "Create Subscription"
- [ ] Icon is a plus sign

#### Test 5.2: Empty State
- [ ] On fresh account with no subscriptions
- [ ] **Expected**: 
  - Message: "No subscriptions yet"
  - Subtext: "Create your first subscription"
  - FAB still visible

#### Test 5.3: Navigation Flow
- [ ] Tap FAB
- [ ] Complete subscription creation
- [ ] **Expected**: Returns to subscription list
- [ ] New subscription appears
- [ ] List refreshes automatically

#### Test 5.4: Subscription List Organization
- [ ] Create multiple subscriptions (mix of single and multi-product)
- [ ] **Expected**: 
  - Most recent at top
  - Clear distinction between types
  - All info clearly visible

#### Test 5.5: Pull to Refresh
- [ ] Pull down on subscriptions list
- [ ] **Expected**: Spinner shows, list refreshes

#### Test 5.6: Cancel Multi-Product Subscription
- [ ] Tap menu on multi-product subscription
- [ ] Select "Cancel Subscription"
- [ ] Confirm
- [ ] **Expected**: Subscription removed

#### Test 5.7: Edit Single-Product Subscription
- [ ] Create single-product subscription
- [ ] Tap menu → Edit
- [ ] Change quantity
- [ ] **Expected**: Updates successfully

---

## 6. Integration Testing

### Test 6.1: Complete Customer Journey
- [ ] Register new customer account
- [ ] Browse products with images
- [ ] Place one-time order
- [ ] Create multi-product subscription
- [ ] View subscriptions
- [ ] Cancel subscription

### Test 6.2: Admin Product Management
- [ ] Login as admin
- [ ] Create product with image
- [ ] Update product image
- [ ] Verify customers see updated image

### Test 6.3: Data Persistence
- [ ] Create subscription
- [ ] Close app
- [ ] Reopen app
- [ ] **Expected**: Subscription still visible

### Test 6.4: Multiple Customers
- [ ] Create subscriptions with Customer A
- [ ] Login as Customer B
- [ ] **Expected**: Customer B doesn't see Customer A's subscriptions

---

## 7. Error Handling & Edge Cases

### Test 7.1: Network Offline
- [ ] Disable network
- [ ] Try to create subscription
- [ ] **Expected**: Error message shown

### Test 7.2: Invalid Token
- [ ] Modify auth token
- [ ] Try to access products
- [ ] **Expected**: Redirect to login

### Test 7.3: Concurrent Updates
- [ ] Open app on two devices
- [ ] Edit same subscription on both
- [ ] **Expected**: Last write wins, no crashes

### Test 7.4: Large Product List
- [ ] Create 100+ products
- [ ] Open products screen
- [ ] **Expected**: Smooth loading and scrolling

### Test 7.5: Image Server Down
- [ ] Stop backend server
- [ ] View products
- [ ] **Expected**: Placeholder icons show

---

## 8. Performance Testing

### Test 8.1: Initial Load Time
- [ ] Time from app launch to products visible
- [ ] **Expected**: < 3 seconds on good connection

### Test 8.2: Subscription Creation Time
- [ ] Time to save multi-product subscription
- [ ] **Expected**: < 2 seconds

### Test 8.3: Image Load Time
- [ ] Time for product images to load
- [ ] **Expected**: Progressive loading, < 1 second per image

### Test 8.4: Memory Usage
- [ ] Monitor app memory while scrolling
- [ ] **Expected**: No memory leaks, stable usage

---

## 9. Compatibility Testing

### Test 9.1: Android Versions
- [ ] Test on Android 10
- [ ] Test on Android 11
- [ ] Test on Android 12+

### Test 9.2: iOS Versions
- [ ] Test on iOS 14
- [ ] Test on iOS 15
- [ ] Test on iOS 16+

### Test 9.3: Screen Orientations
- [ ] Test portrait mode
- [ ] Test landscape mode
- [ ] **Expected**: UI adapts correctly

---

## 10. Accessibility Testing

### Test 10.1: Screen Reader
- [ ] Enable TalkBack (Android) or VoiceOver (iOS)
- [ ] Navigate through screens
- [ ] **Expected**: All elements readable

### Test 10.2: Font Scaling
- [ ] Set system font to large
- [ ] View all screens
- [ ] **Expected**: Text scales appropriately, no overflow

### Test 10.3: Color Contrast
- [ ] Verify button colors have sufficient contrast
- [ ] **Expected**: Meets WCAG AA standards

---

## Test Summary Template

Use this template to track test execution:

```
Test Date: __________
Tester: __________
Environment: __________ (Dev/Staging/Prod)
Device: __________
OS Version: __________

Total Tests: 100+
Passed: _____
Failed: _____
Blocked: _____
Not Tested: _____

Critical Issues: _____
High Priority: _____
Medium Priority: _____
Low Priority: _____

Notes:
__________________________________________
__________________________________________
```

---

## Automated Testing (Future)

Consider implementing:
- Unit tests for validation logic
- Widget tests for Flutter UI
- Integration tests for API endpoints
- E2E tests for critical user flows
- Performance benchmarks
- Accessibility audits

---

**Remember**: All critical functionality should be tested before each release. Focus on:
1. Multi-product subscription creation
2. Image upload and display
3. Order placement
4. UI responsiveness
5. Error handling
