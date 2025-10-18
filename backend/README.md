# KsheerMitra Backend

Production-ready Node.js backend for KsheerMitra Milk Delivery Management System with WhatsApp integration and automated invoicing.

## Tech Stack

- **Runtime**: Node.js (ES6 modules)
- **Framework**: Express.js
- **Database**: PostgreSQL (using pg Client)
- **Authentication**: JWT (access & refresh tokens with rotation)
- **Security**: bcrypt, helmet, cors, rate limiting
- **Validation**: Joi
- **WhatsApp**: whatsapp-web.js
- **PDF Generation**: pdfkit
- **Scheduling**: node-cron
- **Maps**: @googlemaps/google-maps-services-js

## New Features (v2.0)

### WhatsApp Integration
- OTP-based authentication via WhatsApp
- Automated delivery status notifications to customers
- Daily invoice delivery to admin
- Monthly invoice delivery to customers

### Automated Invoice Generation
- Daily invoices for delivery boys (sent to admin at 8 PM)
- Monthly invoices for customers (sent on 1st of month at 9 AM)
- Professional PDF generation with company branding

### Google Maps Integration
- Address geocoding
- Route optimization for delivery boys
- Distance and duration calculations

## Project Structure

```
backend/
├── config/
│   └── db.js                 # PostgreSQL connection
├── controllers/              # HTTP request handlers
├── services/                 # Business logic
│   ├── whatsappService.js   # WhatsApp messaging
│   ├── pdfService.js        # PDF generation
│   ├── invoiceService.js    # Invoice management
│   ├── schedulerService.js  # Cron jobs
│   ├── otpService.js        # OTP authentication
│   └── googleMapsService.js # Maps integration
├── models/                   # Database queries
├── middlewares/
│   └── auth.js              # JWT authentication & role checking
├── routes/                   # API route definitions
├── utils/
│   └── validation.js        # Request validation schemas
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_enhanced_features.sql
│   ├── 003_make_product_id_nullable.sql
│   └── 004_whatsapp_invoice_features.sql
├── invoices/                 # Generated PDF storage
├── server.js                 # Entry point
├── package.json
└── .env.example
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- WhatsApp account for messaging integration
- Google Maps API key (optional, for route optimization)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Create PostgreSQL database:
```bash
createdb ksheermitra
```

4. Run migrations:
```bash
psql -d ksheermitra -f migrations/001_initial_schema.sql
psql -d ksheermitra -f migrations/002_enhanced_features.sql
psql -d ksheermitra -f migrations/003_make_product_id_nullable.sql
psql -d ksheermitra -f migrations/004_whatsapp_invoice_features.sql
```

Or use the migration script:
```bash
chmod +x scripts/run-migrations.sh
./scripts/run-migrations.sh
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

6. Scan WhatsApp QR code:
   - On first run, a QR code will appear in the console
   - Scan it with WhatsApp on your phone
   - Session is saved for future use

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| DB_HOST | PostgreSQL host | localhost |
| DB_PORT | PostgreSQL port | 5432 |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | - |
| DB_NAME | Database name | ksheermitra |
| JWT_ACCESS_SECRET | JWT access token secret | - |
| JWT_REFRESH_SECRET | JWT refresh token secret | - |
| BCRYPT_ROUNDS | Bcrypt cost factor | 12 |
| CORS_ORIGIN | CORS allowed origin | * |
| GOOGLE_MAPS_API_KEY | Google Maps API key | - |
| WHATSAPP_SESSION_PATH | WhatsApp session directory | ./.wwebjs_auth |

## API Endpoints

### Authentication

- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login (rate limited)
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout and invalidate refresh token

### OTP Authentication (NEW)

- `POST /otp/send` - Send OTP via WhatsApp
- `POST /otp/verify` - Verify OTP
- `POST /otp/resend` - Resend OTP

### Users

- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update current user profile

### Products (Admin only)

- `GET /products` - List all products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Subscriptions

- `POST /subscriptions` - Create subscription
- `GET /subscriptions/:id` - Get subscription by ID
- `PUT /subscriptions/:id` - Update subscription
- `DELETE /subscriptions/:id` - Cancel subscription
- `GET /customers/:customerId/subscriptions` - Get customer subscriptions

### Daily Adjustments

- `POST /subscriptions/:subscriptionId/adjustments` - Create/update daily adjustment
- `GET /subscriptions/:subscriptionId/adjustments` - Get adjustments (optional month query param)

### Orders

- `POST /orders` - Create one-off order
- `GET /orders/:id` - Get order by ID
- `GET /customers/:customerId/orders` - Get customer orders (optional month query param)

### Deliveries

- `GET /delivery/assigned` - Get assigned deliveries (delivery_boy only)
- `GET /delivery/all` - Get all deliveries (admin only)
- `GET /delivery/:id` - Get delivery by ID
- `PUT /delivery/:id/status` - Update delivery status (triggers WhatsApp notification)

### Invoices (NEW)

- `POST /invoices/daily` - Generate daily invoice (admin, delivery_boy)
- `POST /invoices/monthly` - Generate monthly invoice (admin)
- `GET /invoices` - Get all invoices (admin)
- `GET /invoices/:id` - Get invoice by ID
- `GET /invoices/:id/download` - Download invoice PDF

### Billing

- `GET /customers/:customerId/billing?month=YYYY-MM` - Get monthly billing with breakdown

### System

- `GET /health` - Health check (includes WhatsApp status)
- `GET /meta` - API metadata

## WhatsApp Integration

### Setup
1. Server automatically initializes WhatsApp client on startup
2. QR code is displayed in console on first run
3. Scan with WhatsApp to authenticate
4. Session is saved in `.wwebjs_auth/` directory

### Message Types
- **OTP**: Authentication codes
- **Delivery Status**: Notifications when delivery is marked delivered/missed
- **Daily Invoice**: PDF sent to admin at end of day
- **Monthly Invoice**: PDF sent to customers on 1st of month

### Phone Number Format
- Store with country code (e.g., 919876543210)
- System automatically formats for WhatsApp

## Automated Jobs

### Daily Invoice Generation
- **Schedule**: 8:00 PM (20:00) every day
- **Action**: Generate invoices for all delivery boys who completed deliveries
- **Output**: PDF sent to admin via WhatsApp

### Monthly Invoice Generation
- **Schedule**: 9:00 AM on 1st of every month
- **Action**: Generate invoices for all customers with deliveries in previous month
- **Output**: PDF sent to each customer via WhatsApp

### Manual Triggers
Both jobs can be manually triggered via API endpoints if needed.

## Security Features

- Password hashing with bcrypt (cost factor 12)
- JWT-based authentication with token rotation
- Refresh token revocation on logout
- Rate limiting on login and OTP endpoints
- Helmet.js security headers
- CORS configuration
- Input validation with Joi
- Parameterized SQL queries to prevent injection
- OTP expiration (10 minutes)

## Database Schema

### Key Tables

- **users**: User accounts with roles (admin, customer, delivery_boy)
- **products**: Product catalog
- **subscriptions**: Recurring daily deliveries
- **daily_adjustments**: Date-specific quantity changes
- **orders**: One-off extra orders
- **deliveries**: Delivery tracking
- **refresh_tokens**: JWT refresh token management
- **invoices**: Generated invoice tracking (NEW)
- **area_assignments**: Delivery boy area management (NEW)
- **whatsapp_messages**: WhatsApp message log (NEW)

### New Columns (v2.0)

**users table:**
- `otp` - Temporary OTP storage
- `otp_expires_at` - OTP expiration timestamp
- `latitude` - User location latitude
- `longitude` - User location longitude

## Billing Calculation

Monthly billing is calculated using:
1. Base subscription quantities for each day
2. Daily adjustments override subscription quantities
3. One-off orders added to daily totals
4. Product unit prices applied
5. Daily and monthly totals computed

Query uses PostgreSQL `generate_series` for efficient per-day aggregation.

## Development Notes

- ES6 module syntax only (`import`/`export`)
- Single PostgreSQL client connection (no pool)
- No demo/mock data - all from database
- Production-ready error handling and logging
- Morgan logger for HTTP requests
- Non-blocking WhatsApp initialization
- Graceful degradation if WhatsApp fails

## Troubleshooting

### WhatsApp not connecting
- Check if puppeteer dependencies are installed
- Try deleting `.wwebjs_auth/` and restarting
- Ensure no firewall blocking

### PDFs not generating
- Check write permissions on `backend/invoices/` directory
- Verify database has delivery data
- Check logs for errors

### Scheduler not running
- Verify system time is correct
- Check cron syntax in `schedulerService.js`
- Review server logs

## Documentation

- [WhatsApp & Invoice Implementation Guide](../WHATSAPP_INVOICE_IMPLEMENTATION.md)
- [API Documentation](../API_DOCUMENTATION.md)
- [Admin API Documentation](../ADMIN_API_DOCUMENTATION.md)
- [Migration Guide](MIGRATION_GUIDE.md)

## License

MIT
