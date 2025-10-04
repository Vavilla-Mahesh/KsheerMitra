# KsheerMitra Setup Guide

## Prerequisites

- Node.js 18+ (Backend)
- PostgreSQL 14+ (Database)
- Flutter 3.0+ (Mobile App)

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE ksheer_mitra;
```

Run the schema migration:

```bash
psql -U postgres -d ksheer_mitra -f migrations/001_initial_schema.sql
```

### 3. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and set your database credentials and secrets:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=ksheer_mitra

# JWT - Generate secure random strings for production
JWT_ACCESS_SECRET=your_secret_here
JWT_REFRESH_SECRET=another_secret_here

# Admin and Delivery credentials will be auto-created
# You can change these values before first run
```

### 4. Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will:
1. Connect to PostgreSQL
2. Auto-create admin and delivery boy accounts from environment variables
3. Start listening on port 3000 (or PORT from .env)

### 5. Verify Setup

Check health endpoint:

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

### 6. Test Admin Login

Login with admin credentials:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@shirmitra.com",
    "password": "AdminPass123"
  }'
```

## Flutter App Setup

### 1. Install Dependencies

```bash
cd flutter_app
flutter pub get
```

### 2. Configure API URL

For local development, the app uses `http://localhost:3000` by default.

To change the API URL:

```bash
flutter run --dart-define=API_BASE_URL=http://your-server:3000
```

Or for Android emulator (to access host machine):

```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000
```

### 3. Run the App

```bash
flutter run
```

Or for a specific device:

```bash
flutter devices  # List available devices
flutter run -d <device-id>
```

## Default Credentials

After setup, you can login with these accounts:

### Admin Account
- Email: `admin@shirmitra.com`
- Password: `AdminPass123`
- Access: Product management, user management, delivery management

### Delivery Boy Account
- Email: `delivery@shirmitra.com`
- Password: `DeliveryPass123`
- Access: View and update assigned deliveries

### Customer Accounts
- Created through signup flow
- Access: Products, subscriptions, orders, billing

## Testing the Application

### 1. Create Products (Admin)
1. Login as admin
2. Navigate to Products tab
3. Click the + button
4. Fill in product details (name, price, unit)
5. Save

### 2. Customer Signup and Subscribe
1. Logout (if logged in)
2. Click "Sign Up" on login screen
3. Fill in customer details
4. Submit - you'll be auto-logged in
5. Browse products on the Products tab
6. Click "Subscribe" on any product
7. Set daily quantity and dates
8. Confirm subscription

### 3. Manage Subscriptions (Customer)
1. Navigate to Subscriptions tab
2. Click the menu (⋮) on any subscription
3. Choose "Edit" to modify quantity or dates
4. Choose "Cancel Subscription" to cancel

### 4. Delivery Management
1. Login as delivery boy
2. View assigned deliveries
3. Update delivery status

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `pg_isready`
- Verify database exists: `psql -l | grep ksheer_mitra`
- Check .env file has correct credentials
- Look at server logs for detailed error messages

### Flutter app can't connect to backend
- Verify backend is running: `curl http://localhost:3000/health`
- For Android emulator, use `10.0.2.2` instead of `localhost`
- For iOS simulator, `localhost` should work
- For physical devices, use your computer's IP address

### Database connection errors
- Ensure PostgreSQL allows TCP/IP connections
- Check pg_hba.conf has correct authentication method
- Verify database user has necessary permissions

### Token/Authentication issues
- Tokens expire after 15 minutes (access) and 30 days (refresh)
- Logout and login again to get fresh tokens
- Check JWT secrets are set in .env

## Production Deployment

### Security Checklist
- [ ] Change all default passwords
- [ ] Generate strong JWT secrets (use `openssl rand -base64 32`)
- [ ] Set NODE_ENV=production
- [ ] Use HTTPS for API endpoints
- [ ] Configure proper CORS_ORIGIN
- [ ] Use environment-specific database credentials
- [ ] Enable PostgreSQL SSL/TLS
- [ ] Set up database backups
- [ ] Configure rate limiting appropriately
- [ ] Review and update .gitignore to prevent credential leaks

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
DB_HOST=your-production-db-host
DB_NAME=ksheer_mitra_prod
CORS_ORIGIN=https://your-app-domain.com
```

### Flutter Build for Production
```bash
# Android
flutter build apk --release --dart-define=API_BASE_URL=https://api.yourdomain.com

# iOS
flutter build ios --release --dart-define=API_BASE_URL=https://api.yourdomain.com
```

## Additional Resources

- [API Documentation](./API_DOCUMENTATION.md)
- [Implementation Notes](./IMPLEMENTATION_NOTES.md)
- [Project Summary](./PROJECT_SUMMARY.md)

## Support

For issues or questions, please check the documentation or create an issue in the repository.
