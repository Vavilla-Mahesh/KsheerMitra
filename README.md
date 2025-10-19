# KsheerMitra (Shir Mitra)

Production-ready Milk Delivery Management System with Flutter mobile app and Node.js backend.

## Overview

KsheerMitra is a comprehensive milk delivery management system designed to handle subscriptions, deliveries, orders, and billing for milk delivery businesses. The system supports multiple user roles (customers, admin, delivery personnel) with role-based access control.

## Tech Stack

### Backend
- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js
- **Database**: PostgreSQL (using pg Client)
- **Authentication**: JWT with access & refresh token rotation
- **Security**: bcrypt (cost 12), helmet, CORS, rate limiting
- **Validation**: Joi

### Frontend
- **Framework**: Flutter (production-ready mobile app)
- **State Management**: Riverpod
- **HTTP Client**: Dio with interceptors
- **Secure Storage**: flutter_secure_storage
- **Themes**: Material Design 3 with dark/light mode

## Features

### Authentication & Authorization
- Email/password authentication (no OTP)
- Secure password hashing with bcrypt
- JWT-based authentication with token rotation
- Persistent login with auto-refresh
- Server-side token revocation on logout
- Role-based access control (admin, customer, delivery_boy)

### 🆕 Enhanced Features (v2.0)

#### Multi-Product Subscriptions
- Subscribe to multiple products in a single subscription
- Flexible scheduling: daily, weekly, or custom schedules
- Specify delivery days (Mon, Wed, Fri, etc.)
- Backward compatible with single-product subscriptions

#### Product Management with Images
- Secure image upload with multer (max 5MB)
- MIME type validation (JPEG, PNG, GIF, WebP)
- Product categories and filtering
- Paginated product listing (Amazon-style)

#### Admin Module
- User management (view, update, deactivate)
- Delivery boy management and status tracking
- Delivery assignment
- Dashboard with system statistics

#### Enhanced Order Management
- One-time orders (e-commerce style)
- Order status tracking
- Offline payment via delivery boy

### User Roles

#### Customer
- Browse products with pagination and category filters
- Create multi-product subscriptions with flexible schedules
- Edit specific date quantities or entire subscription
- Place one-off orders
- View monthly billing with daily breakdown
- Track order and delivery history

#### Admin
- Complete product CRUD with image upload
- User management (view, update, deactivate)
- Delivery boy management and status monitoring
- Delivery assignment to customers
- Dashboard with statistics (active customers, products, deliveries)
- System-wide analytics

#### Delivery Boy
- View assigned deliveries
- Update delivery and order status
- Track current status (available, busy, offline)

#### Delivery Boy
- View assigned deliveries
- Update delivery status
- Track delivery routes
- Only one delivery boy allowed (enforced at DB level)

### Subscription Management
- Recurring daily deliveries
- Flexible start/end dates
- Date-specific quantity adjustments
- Cancel or modify anytime

### Billing System
- Automated monthly billing calculation
- Daily breakdown with line items
- Combines subscriptions, adjustments, and one-off orders
- Transparent pricing based on product unit prices

### Security Features
- Secure token storage on device
- Automatic token refresh
- Rate limiting on authentication endpoints
- Parameterized SQL queries
- Input validation
- HTTPS ready

## Project Structure

```
KsheerMitra/
├── backend/                  # Node.js Express API
│   ├── config/              # Database connection
│   ├── controllers/         # Request handlers
│   ├── services/            # Business logic
│   ├── models/              # Database queries
│   ├── middlewares/         # Auth & validation
│   ├── routes/              # API routes
│   ├── migrations/          # SQL schema
│   └── server.js            # Entry point
│
└── flutter_app/             # Flutter mobile app
    ├── lib/
    │   ├── config/          # API & theme config
    │   ├── models/          # Data models
    │   ├── services/        # API services
    │   ├── providers/       # State management
    │   ├── screens/         # UI screens
    │   └── main.dart        # App entry point
    └── android/             # Android config
```

## Quick Start

### System Validation ✅

Before starting development, run our comprehensive validation suite:

```bash
cd backend

# Install dependencies
npm install

# Validate environment configuration
npm run validate:env

# Run security scan
npm run check:security

# Full system health check (requires PostgreSQL)
npm run check:system

# Check deployment readiness
npm run check:deployment
```

**Status:** ✅ Full system validation complete
- 0 security vulnerabilities (CodeQL verified)
- No hardcoded credentials
- Comprehensive documentation
- Testing framework ready

📖 See [VALIDATION_SUMMARY.md](VALIDATION_SUMMARY.md) for complete validation report.

### Backend Setup

1. **Prerequisites**
   - Node.js (v18+)
   - PostgreSQL (v14+)

2. **Installation**
   ```bash
   cd backend
   npm install
   cp .env .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   ```bash
   createdb ksheermitra
   # Run all migrations using the script
   chmod +x scripts/run-migrations.sh
   ./scripts/run-migrations.sh
   
   # Or manually:
   psql -d ksheermitra -f migrations/001_initial_schema.sql
   psql -d ksheermitra -f migrations/002_enhanced_features.sql
   ```
   
   See [Migration Guide](backend/MIGRATION_GUIDE.md) for detailed instructions.

4. **Start Server**
   ```bash
   npm run dev        # Development
   npm start          # Production
   ```

   Server runs on `http://localhost:3000`

### Frontend Setup

1. **Prerequisites**
   - Flutter SDK (3.0+)
   - Android Studio / Xcode

2. **Installation**
   ```bash
   cd flutter_app
   flutter pub get
   ```

3. **Configure API URL** (optional)
   ```bash
   flutter run --dart-define=API_BASE_URL=http://your-api-url.com
   ```

4. **Run App**
   ```bash
   flutter run
   ```

## Database Schema

### Core Tables

- **users**: User accounts with roles
- **products**: Product catalog with images and categories
- **subscriptions**: Recurring deliveries with flexible schedules
- **subscription_items**: 🆕 Multi-product subscription support
- **daily_adjustments**: Date-specific quantity changes
- **orders**: One-off orders
- **deliveries**: Delivery tracking
- **delivery_status**: 🆕 Delivery boy status tracking
- **refresh_tokens**: JWT token management

### Key Constraints

- Unique email per user
- Only one delivery_boy (partial unique index)
- Foreign key relationships
- Automatic timestamp updates

## API Documentation

### 📚 Documentation Suite

**System Validation & Setup:**
- [VALIDATION_SUMMARY.md](VALIDATION_SUMMARY.md) - ✅ System validation overview
- [FINAL_VALIDATION_REPORT.md](FINAL_VALIDATION_REPORT.md) - Complete validation report
- [DEVELOPER_QUICKSTART.md](DEVELOPER_QUICKSTART.md) - 10-minute setup guide
- [FLUTTER_SETUP_GUIDE.md](FLUTTER_SETUP_GUIDE.md) - Complete Flutter setup
- [VALIDATION_CHECKLIST.md](VALIDATION_CHECKLIST.md) - Detailed checklist

**API & Features:**
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Complete REST API reference
- [ADMIN_API_DOCUMENTATION.md](ADMIN_API_DOCUMENTATION.md) - Admin endpoints
- [ENHANCED_FEATURES_DOCUMENTATION.md](ENHANCED_FEATURES_DOCUMENTATION.md) - New features guide
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Feature overview
- [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) - Comprehensive testing guide

**Integration & Deployment:**
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [backend/MIGRATION_GUIDE.md](backend/MIGRATION_GUIDE.md) - Database setup
- [backend/scripts/README.md](backend/scripts/README.md) - Validation scripts

### Core Documentation
- [API Documentation](API_DOCUMENTATION.md) - Complete REST API reference
- [Admin API Documentation](ADMIN_API_DOCUMENTATION.md) - Admin endpoints
- [Enhanced Features Documentation](ENHANCED_FEATURES_DOCUMENTATION.md) - New features guide
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md) - Feature overview
- [Migration Guide](backend/MIGRATION_GUIDE.md) - Database setup

### Key Endpoints

#### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout

#### Products (with pagination)
- `GET /products?page=1&limit=20&category=dairy` - List products
- `POST /products` - Create product with image (admin)
- `PUT /products/:id` - Update product with image (admin)

#### Subscriptions (enhanced)
- `POST /subscriptions` - Create single or multi-product subscription
- `PUT /subscriptions/:id/adjust-date` - 🆕 Adjust specific date
- `PUT /subscriptions/:id/update-all` - 🆕 Update entire schedule

#### Orders
- `POST /orders` - Place one-time order
- `PUT /orders/:id/status` - 🆕 Update order status

#### Admin (new)
- `GET /admin/users` - List all users
- `PUT /admin/users/:id` - Update user
- `PATCH /admin/users/:id/deactivate` - Deactivate user
- `GET /admin/delivery-boy` - Get delivery boy status
- `POST /admin/assign-delivery` - Assign delivery
- `GET /admin/dashboard` - System statistics

## Environment Variables

### Backend

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=ksheer_mitra
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
BCRYPT_ROUNDS=12
```

### Flutter

Use `--dart-define` flag:
```bash
--dart-define=API_BASE_URL=https://api.example.com
```

## Billing Calculation Logic

For each date D in the billing month:
1. Get active subscriptions overlapping D
2. Check for daily adjustments on D
3. Use adjusted quantity if exists, else use subscription quantity
4. Add one-off orders for D
5. Calculate: quantity × unit_price for each product
6. Sum all line totals for monthly total

Implementation uses PostgreSQL `generate_series` for efficient per-day aggregation.

## Security Best Practices

✅ Implemented:
- bcrypt password hashing (cost 12)
- JWT with short-lived access tokens (15m)
- Refresh token rotation
- Rate limiting on login
- Secure token storage on device
- Input validation
- Parameterized queries
- CORS configuration

⚠️ Recommendations:
- Use HTTPS in production
- Set strong JWT secrets
- Regular security audits
- Monitor rate limits
- Backup database regularly

## Testing

### Automated Validation Scripts

The project includes comprehensive validation tools:

```bash
cd backend

# Environment validation
npm run validate:env

# Security scan
npm run check:security

# Full system check
npm run check:system

# API endpoint testing
npm run test:api

# Deployment readiness
npm run check:deployment
```

**Validation Results:**
- ✅ Security: 0 vulnerabilities (CodeQL verified)
- ✅ Environment: All configurations validated
- ✅ Code Quality: No hardcoded secrets
- ✅ Testing Framework: 100+ test cases ready

See [backend/scripts/README.md](backend/scripts/README.md) for detailed script documentation.

### Backend
```bash
cd backend
npm test
```

### Flutter
```bash
cd flutter_app
flutter test
```

## Deployment

### Backend

1. **Environment**: Set production environment variables
2. **Database**: Run migrations on production DB
3. **Server**: Deploy to Node.js hosting (PM2, Docker, etc.)
4. **SSL**: Configure HTTPS certificate

### Flutter

1. **Android**
   ```bash
   flutter build apk --release
   flutter build appbundle --release
   ```

2. **iOS**
   ```bash
   flutter build ios --release
   ```

## Future Enhancement Points

The codebase includes clear comments for integrating:
- **OTP Authentication**: Add verification step after signup/login
- **Maps Integration**: Location picker and delivery route optimization

These are deliberately excluded but can be easily integrated using the marked integration points.

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create pull request

## License

MIT License

## Support

For issues and questions:
- Open an issue on GitHub
- Contact: support@ksheermitra.com

## Acknowledgments

Built with modern best practices for production-ready applications.