# KsheerMitra Backend

Production-ready Node.js backend for KsheerMitra Milk Delivery Management System.

## Tech Stack

- **Runtime**: Node.js (ES6 modules)
- **Framework**: Express.js
- **Database**: PostgreSQL (using pg Client)
- **Authentication**: JWT (access & refresh tokens with rotation)
- **Security**: bcrypt, helmet, cors, rate limiting
- **Validation**: Joi

## Project Structure

```
backend/
├── config/
│   └── db.js                 # PostgreSQL connection
├── controllers/              # HTTP request handlers
├── services/                 # Business logic
├── models/                   # Database queries
├── middlewares/
│   └── auth.js              # JWT authentication & role checking
├── routes/                   # API route definitions
├── utils/
│   └── validation.js        # Request validation schemas
├── migrations/
│   └── 001_initial_schema.sql
├── server.js                 # Entry point
├── package.json
└── .env.example
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env .env
# Edit .env with your configuration
```

3. Create PostgreSQL database:
```bash
createdb ksheer_mitra
```

4. Run migrations:
```bash
psql -d ksheer_mitra -f migrations/001_initial_schema.sql
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| DB_HOST | PostgreSQL host | localhost |
| DB_PORT | PostgreSQL port | 5432 |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | - |
| DB_NAME | Database name | ksheer_mitra |
| JWT_ACCESS_SECRET | JWT access token secret | - |
| JWT_REFRESH_SECRET | JWT refresh token secret | - |
| JWT_ACCESS_EXPIRY | Access token expiry | 15m |
| JWT_REFRESH_EXPIRY | Refresh token expiry | 30d |
| BCRYPT_ROUNDS | Bcrypt cost factor | 12 |
| CORS_ORIGIN | CORS allowed origin | * |

## API Endpoints

### Authentication

- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login (rate limited)
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout and invalidate refresh token

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
- `PUT /delivery/:id/status` - Update delivery status

### Billing

- `GET /customers/:customerId/billing?month=YYYY-MM` - Get monthly billing with breakdown

### System

- `GET /health` - Health check
- `GET /meta` - API metadata

## Security Features

- Password hashing with bcrypt (cost factor 12)
- JWT-based authentication with token rotation
- Refresh token revocation on logout
- Rate limiting on login endpoint (5 requests per 15 minutes)
- Helmet.js security headers
- CORS configuration
- Input validation with Joi
- Parameterized SQL queries to prevent injection

## Database Schema

### Key Tables

- **users**: User accounts with roles (admin, customer, delivery_boy)
- **products**: Product catalog
- **subscriptions**: Recurring daily deliveries
- **daily_adjustments**: Date-specific quantity changes
- **orders**: One-off extra orders
- **deliveries**: Delivery tracking
- **refresh_tokens**: JWT refresh token management

### Constraints

- Unique email for users
- Only one delivery_boy allowed (enforced via partial unique index)
- Foreign key relationships maintained
- Automatic timestamp updates via triggers

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

## Future Enhancements

<!-- Integration points for OTP authentication -->
<!-- Integration points for Maps/location services -->

These features are deliberately excluded but can be added by implementing the commented integration points in the codebase.
