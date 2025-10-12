# KsheerMitra Quick Start Guide

Get KsheerMitra up and running in 5 minutes!

## Prerequisites

- Node.js v18+ installed
- PostgreSQL v14+ installed and running
- Git (to clone the repository)

## Step 1: Clone the Repository

```bash
git clone https://github.com/Vavilla-Mahesh/KsheerMitra.git
cd KsheerMitra
```

## Step 2: Backend Setup

### Configure Environment

```bash
cd backend
cp .env .env
```

Edit `.env` with your PostgreSQL credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=ksheermitra
```

### Install Dependencies

```bash
npm install
```

### Setup Database

```bash
# Create database
createdb ksheermitra

# Run migrations
chmod +x scripts/run-migrations.sh
./scripts/run-migrations.sh
```

Or manually:
```bash
psql -d ksheermitra -f migrations/001_initial_schema.sql
psql -d ksheermitra -f migrations/002_enhanced_features.sql
```

### Start Backend Server

```bash
npm start
```

Server will start on `http://localhost:3000`

## Step 3: Test the Setup

### Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Login as Admin

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ksheermitra.com",
    "password": "admin123"
  }'
```

You'll receive an access token. Copy it for use in subsequent requests.

### Create a Product (with Image)

```bash
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "name=Full Cream Milk" \
  -F "description=Fresh full cream milk" \
  -F "unit_price=50" \
  -F "unit=litre" \
  -F "category=dairy" \
  -F "is_active=true" \
  -F "image=@/path/to/your/image.jpg"
```

### List Products

```bash
curl -X GET "http://localhost:3000/products?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create a Multi-Product Subscription

```bash
curl -X POST http://localhost:3000/subscriptions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "YOUR_CUSTOMER_ID",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "schedule_type": "weekly",
    "days_of_week": "[\"Mon\", \"Wed\", \"Fri\"]",
    "items": [
      {
        "product_id": "YOUR_PRODUCT_ID",
        "quantity": 2
      }
    ]
  }'
```

## Step 4: Access Admin Features

### Get All Users

```bash
curl -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Dashboard Statistics

```bash
curl -X GET http://localhost:3000/admin/dashboard \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Delivery Boy Status

```bash
curl -X GET http://localhost:3000/admin/delivery-boy \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Default Credentials

### Admin User
- Email: `admin@ksheermitra.com`
- Password: `admin123`
- Role: `admin`

### Delivery Boy
- Email: `delivery@ksheermitra.com`
- Password: `delivery123`
- Role: `delivery_boy`

**⚠️ Important**: Change these credentials in production!

## Next Steps

1. **Read the Documentation**
   - [API Documentation](API_DOCUMENTATION.md)
   - [Admin API Documentation](ADMIN_API_DOCUMENTATION.md)
   - [Enhanced Features Documentation](ENHANCED_FEATURES_DOCUMENTATION.md)
   - [Implementation Summary](IMPLEMENTATION_SUMMARY.md)

2. **Test the Features**
   - Create customers via signup endpoint
   - Create products with images
   - Create multi-product subscriptions
   - Test flexible scheduling
   - Place one-time orders
   - Update order status

3. **Customize**
   - Update admin and delivery boy credentials
   - Configure CORS for your frontend
   - Add your own products
   - Set up production database

4. **Deploy**
   - See [Deployment Guide](DEPLOYMENT.md)
   - Configure production environment
   - Set up HTTPS
   - Configure backups

## Troubleshooting

### Database Connection Error
```
Error: Database connection error
```
**Solution**: Check your database credentials in `.env` and ensure PostgreSQL is running.

### Migration Errors
```
ERROR: relation "users" already exists
```
**Solution**: Tables already exist. Either:
- Skip the migration (already done)
- Drop and recreate database: `dropdb ksheermitra && createdb ksheermitra`

### Port Already in Use
```
Error: Port 3000 is already in use
```
**Solution**: Change `PORT` in `.env` or stop the process using port 3000.

### Module Not Found
```
Error: Cannot find module 'express'
```
**Solution**: Run `npm install` in the backend directory.

## Testing with Postman

1. Import the API collection (if available)
2. Set environment variables:
   - `base_url`: `http://localhost:3000`
   - `access_token`: Your JWT token from login
3. Start testing endpoints

## Development Mode

For development with auto-reload:

```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.

## Support

For help and issues:
- Check the documentation files
- Review the [Migration Guide](backend/MIGRATION_GUIDE.md)
- Inspect code comments
- Test with provided examples

## What's Next?

- **Frontend**: Set up Flutter mobile app (see `ksheermitra/` directory)
- **Production**: Deploy to cloud (AWS, Heroku, DigitalOcean)
- **Features**: Add OTP, maps integration, notifications
- **Analytics**: Implement reporting and charts

---

**Congratulations!** 🎉 You have successfully set up KsheerMitra backend.
