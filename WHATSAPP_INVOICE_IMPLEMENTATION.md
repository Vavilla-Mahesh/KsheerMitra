# WhatsApp Integration & Invoice Automation - Implementation Guide

## Overview

This implementation adds comprehensive WhatsApp integration, automated invoice generation (PDF), and scheduled jobs to the KsheerMitra backend.

## New Features

### 1. WhatsApp Integration (whatsapp-web.js)

#### Features:
- OTP-based authentication
- Delivery status notifications
- Daily invoice delivery to admin
- Monthly invoice delivery to customers

#### Setup:
1. Install dependencies (already done via npm)
2. Start the server
3. Scan the QR code displayed in the console with WhatsApp
4. Once authenticated, the session is saved for future use

#### API Endpoints:
- `POST /otp/send` - Send OTP to phone number
- `POST /otp/verify` - Verify OTP
- `POST /otp/resend` - Resend OTP

### 2. PDF Invoice Generation (pdfkit)

#### Features:
- Daily invoices for delivery boys
- Monthly invoices for customers
- Professionally formatted PDFs with company branding

#### Storage:
- PDFs are stored in `backend/invoices/` directory
- File naming: `daily_invoice_{deliveryBoyId}_{date}.pdf` or `monthly_invoice_{customerId}_{month}_{year}.pdf`

### 3. Automated Scheduling (node-cron)

#### Jobs:
1. **Daily Invoice Generation**: Runs at 8:00 PM (20:00) every day
   - Generates invoices for all delivery boys who completed deliveries
   - Sends PDFs to admin via WhatsApp

2. **Monthly Invoice Generation**: Runs at 9:00 AM on 1st of every month
   - Generates invoices for all customers with deliveries in previous month
   - Sends PDFs to customers via WhatsApp

### 4. Google Maps Integration

#### Features:
- Geocoding addresses to coordinates
- Route optimization for delivery boys
- Distance and duration calculations

#### Setup:
- Set `GOOGLE_MAPS_API_KEY` in `.env` file
- Optional: System works without it, but route optimization will be disabled

## Database Changes

### New Tables:

1. **invoices**
   - Tracks all generated invoices
   - Links to delivery boys and customers
   - Stores PDF path and WhatsApp send status

2. **area_assignments**
   - Manages delivery boy area assignments
   - Stores customer lists per area

3. **whatsapp_messages**
   - Logs all WhatsApp messages sent
   - Tracks delivery status and errors

### New Columns:

**users table:**
- `otp` - Stores temporary OTP
- `otp_expires_at` - OTP expiration timestamp
- `latitude` - User location latitude
- `longitude` - User location longitude

## Workflow Changes

### Delivery Status Update Flow:

1. Delivery boy marks delivery as "delivered" or "failed"
2. Backend updates delivery status in database
3. Backend sends WhatsApp message to customer
4. Customer receives notification: "✅ Delivered" or "❌ Missed"

### Daily Invoice Flow:

**Manual Trigger:**
- Admin or delivery boy can trigger via: `POST /invoices/daily`
- Request body: `{ "deliveryBoyId": "uuid", "date": "2024-10-18" }`

**Automatic Trigger:**
- Runs at 8:00 PM daily
- Processes all delivery boys with completed deliveries
- Generates PDF and sends to admin via WhatsApp

### Monthly Invoice Flow:

**Manual Trigger:**
- Admin can trigger via: `POST /invoices/monthly`
- Request body: `{ "customerId": "uuid", "month": 10, "year": 2024 }`

**Automatic Trigger:**
- Runs at 9:00 AM on 1st of month
- Processes all customers with deliveries in previous month
- Generates PDF and sends to customer via WhatsApp

## API Endpoints

### Invoice Management

```
POST   /invoices/daily              Generate daily invoice (admin, delivery_boy)
POST   /invoices/monthly            Generate monthly invoice (admin)
GET    /invoices                    Get all invoices (admin)
GET    /invoices/:id                Get invoice by ID
GET    /invoices/:id/download       Download invoice PDF
```

### OTP Authentication

```
POST   /otp/send                    Send OTP via WhatsApp
POST   /otp/verify                  Verify OTP
POST   /otp/resend                  Resend OTP
```

## Environment Variables

Add these to your `.env` file:

```env
# Google Maps API (optional)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# WhatsApp Configuration
WHATSAPP_SESSION_PATH=./.wwebjs_auth
```

## Running Migrations

```bash
# Navigate to backend directory
cd backend

# Run the new migration
psql -d ksheermitra -f migrations/004_whatsapp_invoice_features.sql
```

Or use the migration script:
```bash
chmod +x scripts/run-migrations.sh
./scripts/run-migrations.sh
```

## Testing

### Test OTP Flow:

```bash
# Send OTP
curl -X POST http://localhost:3000/otp/send \
  -H "Content-Type: application/json" \
  -d '{"phone": "919876543210"}'

# Verify OTP
curl -X POST http://localhost:3000/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"phone": "919876543210", "otp": "123456"}'
```

### Test Invoice Generation:

```bash
# Generate daily invoice (requires authentication)
curl -X POST http://localhost:3000/invoices/daily \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"deliveryBoyId": "delivery-boy-uuid", "date": "2024-10-18"}'

# Get all invoices
curl -X GET http://localhost:3000/invoices \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Delivery Status Update:

```bash
# Update delivery status (triggers WhatsApp notification)
curl -X PUT http://localhost:3000/delivery/:id/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"status": "delivered", "notes": "Delivered successfully"}'
```

## Important Notes

### WhatsApp Setup:
1. On first run, a QR code will be displayed in the console
2. Scan it with WhatsApp on your phone
3. Session is saved and will auto-reconnect on restart
4. If QR code times out, restart the server

### Phone Number Format:
- Store phone numbers with country code (e.g., 919876543210)
- System automatically formats for WhatsApp

### Error Handling:
- If WhatsApp fails, delivery updates still succeed
- Failed messages are logged in `whatsapp_messages` table
- Server continues to run even if WhatsApp initialization fails

### Scheduler:
- Cron jobs start automatically with server
- Can be disabled by commenting out `initializeScheduler()` in `server.js`
- Manual triggers available via API endpoints

### PDF Storage:
- PDFs are stored locally in `backend/invoices/`
- Add to `.gitignore` to avoid committing large files
- Consider cloud storage (S3, GCS) for production

## Security Considerations

1. **Rate Limiting**: OTP endpoints have rate limiting (5 requests per 15 minutes)
2. **OTP Expiration**: OTPs expire after 10 minutes
3. **Authentication**: All invoice endpoints require JWT authentication
4. **Role-Based Access**: Endpoints have role-based authorization
5. **WhatsApp Session**: Session data is stored locally and should be secured

## Troubleshooting

### WhatsApp not connecting:
- Check if port is blocked
- Ensure puppeteer dependencies are installed
- Try deleting `.wwebjs_auth/` and restarting

### PDFs not generating:
- Check write permissions on `backend/invoices/` directory
- Verify database queries are returning data
- Check logs for errors

### Scheduler not running:
- Verify system time is correct
- Check cron syntax in `schedulerService.js`
- Look for errors in server logs

### Google Maps errors:
- Verify API key is valid
- Check API is enabled in Google Cloud Console
- Ensure billing is enabled

## Future Enhancements

1. **Area Assignment UI**: Admin interface for assigning areas to delivery boys
2. **Payment Integration**: Link invoices with payment gateways
3. **WhatsApp Templates**: Use official WhatsApp Business API with templates
4. **Invoice Customization**: Allow admin to customize invoice templates
5. **Multi-language Support**: Invoices and messages in multiple languages
6. **Analytics Dashboard**: Track WhatsApp message delivery rates
7. **Backup & Archive**: Automatic invoice archival to cloud storage

## Support

For issues or questions:
- Check server logs: `tail -f backend/logs/*.log`
- Review database migrations: `backend/migrations/`
- Check API documentation: `API_DOCUMENTATION.md`
