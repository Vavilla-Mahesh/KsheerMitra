# KsheerMitra (Shir Mitra)

Production-ready Milk Delivery Management System with Flutter mobile app and Node.js backend.

## 🆕 Latest Features (v3.0)

### WhatsApp-Based Authentication
- **WhatsApp OTP Login**: Secure authentication using WhatsApp Business Cloud API
- **No Password Required**: Passwordless authentication for better UX
- **Auto-Login**: Returning users authenticated via OTP
- **New User Onboarding**: Seamless signup flow with location selection

### Google Maps Integration
- **Location Picker**: Interactive map for selecting delivery addresses
- **Auto-Geocoding**: Convert addresses to coordinates automatically
- **Route Visualization**: See delivery routes on map
- **Distance Calculation**: Accurate distance and ETA using Google Directions API

### Dynamic Delivery Area Assignment
- **Area Management**: Admin can create and manage delivery zones
- **Customer Assignment**: Assign customers to specific areas and delivery personnel
- **Multiple Delivery Boys**: Support for multiple delivery personnel (removed single delivery boy constraint)
- **Visual Map View**: See all customers on map for easy area planning

### Route Optimization
- **Automated Route Planning**: Generate optimized delivery routes using Google Directions API
- **Turn-by-Turn Navigation**: Step-by-step route guidance
- **Real-Time Updates**: Mark deliveries as completed in real-time
- **Performance Metrics**: Track distance, time, and completion rates
- **Delivery Logs**: Detailed logs for each delivery with timestamps

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
- **External APIs**: WhatsApp Business Cloud API, Google Maps Platform

### Frontend
- **Framework**: Flutter (production-ready mobile app)
- **State Management**: Riverpod
- **HTTP Client**: Dio with interceptors
- **Secure Storage**: flutter_secure_storage
- **Maps**: Google Maps Flutter SDK
- **Location Services**: Location & Geocoding packages
- **Themes**: Material Design 3 with dark/light mode

## Features

### Authentication & Authorization
- **WhatsApp OTP Authentication**: Passwordless login via WhatsApp
- **Email/Password Authentication**: Traditional login method (legacy support)
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
   - Google Maps API Key

2. **Installation**
   ```bash
   cd ksheermitra
   flutter pub get
   ```

3. **Configure Google Maps** 
   
   **Android**: Edit `android/app/src/main/AndroidManifest.xml`
   ```xml
   <meta-data
       android:name="com.google.android.geo.API_KEY"
       android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
   ```
   
   **iOS**: Edit `ios/Runner/AppDelegate.swift`
   ```swift
   GMSServices.provideAPIKey("YOUR_GOOGLE_MAPS_API_KEY")
   ```

4. **Run App**
   ```bash
   flutter run
   ```

### Quick Start for New Features

For WhatsApp Authentication and Delivery Management setup:
- See [Quick Start Guide](QUICK_START_NEW_FEATURES.md) - 5-minute setup
- See [Detailed Setup Guide](WHATSAPP_MAPS_SETUP.md) - Complete documentation

## Database Schema

### Core Tables

- **users**: User accounts with roles, WhatsApp numbers, and locations
- **products**: Product catalog with images and categories
- **subscriptions**: Recurring deliveries with flexible schedules
- **subscription_items**: 🆕 Multi-product subscription support
- **daily_adjustments**: Date-specific quantity changes
- **orders**: One-off orders
- **deliveries**: Delivery tracking
- **delivery_status**: 🆕 Delivery boy status tracking
- **refresh_tokens**: JWT token management

### 🆕 New Tables (v3.0)

- **otp_verifications**: WhatsApp OTP codes and verification
- **delivery_areas**: Admin-defined delivery zones with polygon coordinates
- **delivery_routes**: Optimized routes with Google Maps data
- **delivery_logs**: Individual delivery completion tracking

### Key Constraints

- Unique email per user (nullable for WhatsApp-only users)
- Unique WhatsApp number per user
- Multiple delivery boys supported (removed single boy constraint)
- Foreign key relationships
- Automatic timestamp updates

## API Documentation

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