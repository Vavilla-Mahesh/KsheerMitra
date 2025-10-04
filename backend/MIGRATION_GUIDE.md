# Database Migration Guide

This guide explains how to set up and run database migrations for KsheerMitra.

## Prerequisites

- PostgreSQL installed and running
- Node.js and npm installed
- Database credentials configured in `.env`

## Environment Setup

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=ksheermitra

# JWT Secrets
JWT_ACCESS_SECRET=your_access_secret_here_change_in_production
JWT_REFRESH_SECRET=your_refresh_secret_here_change_in_production

# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*

# Admin User (will be created automatically if not exists)
ADMIN_EMAIL=admin@ksheermitra.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin User
ADMIN_PHONE=1234567890
ADMIN_LOCATION=Admin Office

# Delivery Boy (will be created automatically if not exists)
DELIVERY_BOY_EMAIL=delivery@ksheermitra.com
DELIVERY_BOY_PASSWORD=delivery123
DELIVERY_BOY_NAME=Delivery Boy
DELIVERY_BOY_PHONE=9876543210
DELIVERY_BOY_LOCATION=Delivery Hub
```

## Running Migrations

### 1. Create Database

First, create the database in PostgreSQL:

```bash
psql -U postgres
CREATE DATABASE ksheermitra;
\q
```

### 2. Run Initial Schema Migration

```bash
psql -U your_db_user -d ksheermitra -f migrations/001_initial_schema.sql
```

This creates:
- `users` table with roles
- `products` table
- `subscriptions` table
- `daily_adjustments` table
- `orders` table
- `deliveries` table
- `refresh_tokens` table
- Indexes and triggers

### 3. Run Enhanced Features Migration

```bash
psql -U your_db_user -d ksheermitra -f migrations/002_enhanced_features.sql
```

This adds:
- `status` field to users table
- `image_url` and `category` fields to products table
- `schedule_type` and `days_of_week` fields to subscriptions table
- `subscription_items` table for multi-product subscriptions
- `delivery_status` table for tracking delivery boy status
- Additional indexes

## Migration Files

### 001_initial_schema.sql
The foundational schema including:
- User management with role-based access
- Product catalog
- Subscription system
- Daily adjustments
- Order management
- Delivery tracking
- JWT refresh token management

### 002_enhanced_features.sql
Enhanced features including:
- User status management (active/inactive)
- Product images and categories
- Multi-product subscriptions with flexible scheduling
- Delivery boy status tracking
- Support for weekly and custom schedule types

## Verifying Migrations

After running migrations, verify the tables were created:

```bash
psql -U your_db_user -d ksheermitra
\dt
```

You should see:
- users
- products
- subscriptions
- subscription_items (new)
- daily_adjustments
- orders
- deliveries
- delivery_status (new)
- refresh_tokens

## Starting the Server

Once migrations are complete:

```bash
npm install
npm start
```

The server will:
1. Connect to the database
2. Automatically create admin and delivery boy users if they don't exist
3. Start listening on the configured PORT

## Testing the Setup

### 1. Check Health Endpoint

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

### 2. Login as Admin

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ksheermitra.com",
    "password": "admin123"
  }'
```

### 3. Create a Product with Image

```bash
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "name=Full Cream Milk" \
  -F "description=Fresh full cream milk" \
  -F "unit_price=50" \
  -F "unit=litre" \
  -F "category=dairy" \
  -F "image=@/path/to/image.jpg"
```

## Rollback (if needed)

To rollback migrations, you can drop the database and recreate:

```bash
psql -U postgres
DROP DATABASE ksheermitra;
CREATE DATABASE ksheermitra;
\q
```

Then run migrations again from step 2.

## Future Migrations

To create additional migrations:

1. Create a new file: `migrations/003_your_feature.sql`
2. Add your SQL statements
3. Run the migration: `psql -U your_db_user -d ksheermitra -f migrations/003_your_feature.sql`
4. Update this guide

## Common Issues

### Issue: "relation already exists"
**Solution**: Tables already exist. Either skip the migration or drop and recreate the database.

### Issue: "password authentication failed"
**Solution**: Check your database credentials in `.env` file.

### Issue: "database does not exist"
**Solution**: Create the database first using `CREATE DATABASE ksheermitra;`

### Issue: "permission denied"
**Solution**: Ensure your database user has necessary privileges:
```sql
GRANT ALL PRIVILEGES ON DATABASE ksheermitra TO your_db_user;
```

## Production Considerations

For production deployments:

1. **Change Default Credentials**: Update admin and delivery boy credentials
2. **Use Strong Secrets**: Generate strong JWT secrets
3. **Enable SSL**: Configure PostgreSQL SSL connections
4. **Backup Strategy**: Set up regular database backups
5. **Migration Tracking**: Consider using a migration tool like `node-pg-migrate` or `knex`
6. **Environment Variables**: Never commit `.env` to version control

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js pg Module](https://node-postgres.com/)
- [API Documentation](../API_DOCUMENTATION.md)
- [Admin API Documentation](../ADMIN_API_DOCUMENTATION.md)
- [Enhanced Features Documentation](../ENHANCED_FEATURES_DOCUMENTATION.md)
