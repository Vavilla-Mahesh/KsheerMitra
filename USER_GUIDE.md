# KsheerMitra - User Guide for New Features

This guide explains how to use the newly implemented features in KsheerMitra.

## For Customers

### Browsing Products

1. **View Products**
   - Navigate to the Products tab
   - Products are displayed in a responsive grid layout
   - Each product shows:
     - Product image (if available)
     - Product name
     - Price per unit
     - Two action buttons

2. **Product Actions**
   - **Order Button**: Place a one-time order for immediate delivery
   - **Cart Button**: Add product to cart (coming soon)
   - **Tap on card**: View detailed product information

### Placing One-Time Orders

1. Tap the "Order" button on any product card
2. In the dialog:
   - Enter the quantity you want to order
   - Select the delivery date
   - Tap "Order Now"
3. You'll see a confirmation message when the order is placed successfully

### Creating Multi-Product Subscriptions

#### Step 1: Start Creating a Subscription
1. Navigate to the Subscriptions tab
2. Tap the "Create Subscription" button (floating button at bottom-right)

#### Step 2: Add Products
1. Browse the list of available products at the bottom
2. Tap on a product to add it to your subscription
3. In the popup:
   - Enter the daily quantity for that product
   - Tap "Add"
4. Repeat for all products you want in your subscription
5. You can edit quantities by tapping the edit icon on selected products
6. Remove products by tapping the delete icon

#### Step 3: Set Schedule
1. **Choose Frequency**:
   - **Every Day**: Delivery every single day
   - **Specific Days**: Select which days of the week
   - **Custom Schedule**: For advanced scheduling (future feature)

2. **For Weekly Schedule**:
   - Tap on day chips to select delivery days
   - Selected days are highlighted
   - You can select multiple days (e.g., Mon, Wed, Fri)

3. **Set Dates**:
   - **Start Date**: When subscription should begin (default: today)
   - **End Date**: When subscription should end (optional, leave empty for ongoing)

#### Step 4: Save Subscription
1. Review your selected products and schedule
2. Tap "Save Subscription" at the bottom
3. Wait for confirmation message
4. You'll be returned to the subscriptions list

### Managing Subscriptions

#### Viewing Your Subscriptions
1. Navigate to Subscriptions tab
2. You'll see all your active and inactive subscriptions
3. Each subscription shows:
   - Product name(s)
   - Quantity or number of products
   - Start date and end date
   - Schedule type
   - Active/Inactive status

#### Single-Product Subscriptions (Legacy)
For subscriptions with one product:
- **Edit**: Change quantity, status, or end date
- **Adjust Date Quantity**: Override quantity for a specific date
- **Cancel Subscription**: Stop the subscription

#### Multi-Product Subscriptions
For subscriptions with multiple products:
- **View Details**: See all products and quantities
- **Cancel Subscription**: Stop the entire subscription

#### Adjusting for Specific Dates (Single-Product Only)
1. Tap the menu icon (⋮) on a subscription
2. Select "Adjust Date Quantity"
3. Pick a specific date
4. Enter the adjusted quantity (enter 0 to skip that day)
5. Tap "Save"

#### Editing Subscriptions (Single-Product Only)
1. Tap the menu icon (⋮) on a subscription
2. Select "Edit"
3. Update:
   - Daily quantity
   - Active/Inactive status
   - End date
4. Tap "Update"

#### Canceling Subscriptions
1. Tap the menu icon (⋮) on any subscription
2. Select "Cancel Subscription"
3. Confirm your choice
4. The subscription will be removed

## For Administrators

### Adding Products with Images

1. Navigate to Admin → Products
2. Tap the "+" button to add a new product
3. Fill in product details:
   - Name (required)
   - Description
   - Unit Price (required)
   - Unit (e.g., liter, kg)
   - Category (optional)
4. **Add Image**:
   - Tap on the image area or camera icon
   - Choose image from gallery or take a photo
   - Supported formats: JPEG, PNG, WebP
   - Maximum size: 5MB
5. Tap "Save" to create the product

### Editing Product Images

1. Find the product in the list
2. Tap on the product or edit icon
3. Change any details including the image
4. Tap "Update"

### Managing Customer Subscriptions

Administrators can view and manage all customer subscriptions:
- View all subscriptions (single and multi-product)
- Cancel problematic subscriptions
- Monitor subscription patterns

## Technical Notes

### Image Display
- Images are served from the backend server
- If an image fails to load, a placeholder icon is shown
- Images are cached by the device for better performance

### Data Synchronization
- Subscriptions list refreshes automatically after creating new ones
- Pull down to refresh any list
- Changes are saved immediately to the server

### Validation
- Quantities must be positive integers
- End date must be after start date
- Weekly schedules require at least one day selected
- Multi-product subscriptions require at least one product

### Error Handling
- Network errors show user-friendly messages
- Invalid data is caught before submission
- All errors can be retried

## Tips & Best Practices

### For Customers
1. **Start Simple**: Create your first subscription with just one product to understand the flow
2. **Weekly Schedules**: Use weekly schedules if you only want deliveries on certain days
3. **Date Adjustments**: Use date adjustments for temporary changes (vacations, special occasions)
4. **Regular Orders**: Use one-time orders for special occasions or bulk purchases

### For Administrators
1. **High-Quality Images**: Use clear, well-lit product photos
2. **Consistent Naming**: Use consistent product names and categories
3. **Regular Updates**: Keep product prices and availability up to date
4. **Monitor Usage**: Check which products are popular in subscriptions

## Troubleshooting

### Images Not Showing
- Check your internet connection
- Try refreshing the screen (pull down)
- Images may take a moment to load on slow connections

### Can't Create Subscription
- Ensure at least one product is selected
- Check that quantities are valid numbers
- For weekly schedule, select at least one day
- Verify start date is not in the past

### Subscription Not Updating
- Pull down to refresh the list
- Check your internet connection
- Try logging out and back in

## Future Features Coming Soon

- **Shopping Cart**: Add multiple products before ordering
- **Order History**: View past one-time orders
- **Subscription Analytics**: See spending patterns and savings
- **Product Ratings**: Rate and review products
- **Delivery Tracking**: Real-time delivery status

## Support

If you encounter any issues or have questions:
1. Check this user guide first
2. Try logging out and back in
3. Ensure you have the latest app version
4. Contact support through the app settings

---

**Last Updated**: October 2025
**App Version**: 1.0.0 with Multi-Product Subscription Support
