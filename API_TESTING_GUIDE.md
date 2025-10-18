# API Testing Guide for WhatsApp & Invoice Features

This document provides curl commands and Postman collection examples for testing the new WhatsApp and invoice features.

## Prerequisites

- Server running on `http://localhost:3000`
- Database migrations applied
- WhatsApp client authenticated (QR code scanned)
- Admin JWT token for authenticated requests

## 1. Health Check

Test if WhatsApp is connected:

```bash
curl -X GET http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2024-10-18T13:00:00.000Z",
  "whatsappReady": true
}
```

## 2. OTP Authentication

### Send OTP

```bash
curl -X POST http://localhost:3000/otp/send \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "919876543210"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "expiresAt": "2024-10-18T13:10:00.000Z"
  }
}
```

### Verify OTP

```bash
curl -X POST http://localhost:3000/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "919876543210",
    "otp": "123456"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "success": true,
    "userId": "user-uuid",
    "role": "customer"
  }
}
```

### Resend OTP

```bash
curl -X POST http://localhost:3000/otp/resend \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "919876543210"
  }'
```

## 3. Delivery Status Update (Triggers WhatsApp)

### Update to Delivered

```bash
curl -X PUT http://localhost:3000/delivery/{delivery-id}/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "delivered",
    "notes": "Delivered successfully"
  }'
```

This will:
1. Update delivery status in database
2. Send WhatsApp message to customer: "✅ Your milk for {date} has been delivered"

### Update to Failed (Missed)

```bash
curl -X PUT http://localhost:3000/delivery/{delivery-id}/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "failed",
    "notes": "Customer not available"
  }'
```

This will:
1. Update delivery status in database
2. Send WhatsApp message to customer: "❌ Your milk for {date} was missed"

## 4. Invoice Generation

### Generate Daily Invoice (Manual)

```bash
curl -X POST http://localhost:3000/invoices/daily \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "deliveryBoyId": "delivery-boy-uuid",
    "date": "2024-10-18"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Daily invoice generated successfully",
  "data": {
    "success": true,
    "invoice": {
      "id": "invoice-uuid",
      "type": "DAILY",
      "amount": "1250.00",
      "pdf_path": "/path/to/invoice.pdf",
      "sent_via_whatsapp": true
    },
    "pdfPath": "/path/to/invoice.pdf"
  }
}
```

This will:
1. Generate PDF invoice for delivery boy's deliveries
2. Send PDF to admin via WhatsApp
3. Store invoice record in database

### Generate Monthly Invoice (Manual)

```bash
curl -X POST http://localhost:3000/invoices/monthly \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "customerId": "customer-uuid",
    "month": 10,
    "year": 2024
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Monthly invoice generated successfully",
  "data": {
    "success": true,
    "invoice": {
      "id": "invoice-uuid",
      "type": "MONTHLY",
      "amount": "3500.00",
      "pdf_path": "/path/to/invoice.pdf",
      "sent_via_whatsapp": true
    },
    "pdfPath": "/path/to/invoice.pdf"
  }
}
```

This will:
1. Generate PDF invoice for customer's monthly deliveries
2. Send PDF to customer via WhatsApp
3. Store invoice record in database

## 5. Invoice Management

### Get All Invoices

```bash
curl -X GET http://localhost:3000/invoices \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

With filters:
```bash
curl -X GET "http://localhost:3000/invoices?type=DAILY&startDate=2024-10-01&endDate=2024-10-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Invoice by ID

```bash
curl -X GET http://localhost:3000/invoices/{invoice-id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Download Invoice PDF

```bash
curl -X GET http://localhost:3000/invoices/{invoice-id}/download \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output invoice.pdf
```

## 6. Testing Automated Jobs

The scheduler runs these jobs automatically:

### Daily Invoice Job (8:00 PM daily)
- Processes all delivery boys with completed deliveries
- Generates and sends invoices to admin

### Monthly Invoice Job (9:00 AM, 1st of month)
- Processes all customers with deliveries in previous month
- Generates and sends invoices to customers

To test without waiting:
1. Adjust cron schedule in `services/schedulerService.js` temporarily
2. Or use manual triggers via API (shown above)

## 7. Testing WhatsApp Messages

### Check WhatsApp Message Log

```sql
-- Run in PostgreSQL
SELECT * FROM whatsapp_messages 
ORDER BY created_at DESC 
LIMIT 10;
```

This shows:
- All messages sent
- Status (pending, sent, failed)
- Error messages if any

## 8. Error Scenarios

### OTP Rate Limiting

Try sending more than 5 OTP requests in 15 minutes:

```bash
for i in {1..6}; do
  curl -X POST http://localhost:3000/otp/send \
    -H "Content-Type: application/json" \
    -d '{"phone": "919876543210"}'
  echo ""
done
```

Expected: 6th request should be rate limited

### Invalid OTP

```bash
curl -X POST http://localhost:3000/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "919876543210",
    "otp": "000000"
  }'
```

Expected response:
```json
{
  "success": false,
  "message": "Invalid OTP"
}
```

### Expired OTP

Wait 11 minutes after sending OTP, then verify:

```bash
curl -X POST http://localhost:3000/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "919876543210",
    "otp": "123456"
  }'
```

Expected response:
```json
{
  "success": false,
  "message": "OTP has expired"
}
```

## 9. Postman Collection

Import this JSON into Postman:

```json
{
  "info": {
    "name": "KsheerMitra WhatsApp & Invoices",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/health",
          "host": ["{{baseUrl}}"],
          "path": ["health"]
        }
      }
    },
    {
      "name": "Send OTP",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"phone\": \"919876543210\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/otp/send",
          "host": ["{{baseUrl}}"],
          "path": ["otp", "send"]
        }
      }
    },
    {
      "name": "Verify OTP",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"phone\": \"919876543210\",\n  \"otp\": \"123456\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/otp/verify",
          "host": ["{{baseUrl}}"],
          "path": ["otp", "verify"]
        }
      }
    },
    {
      "name": "Generate Daily Invoice",
      "request": {
        "method": "POST",
        "header": [
          {"key": "Content-Type", "value": "application/json"},
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"deliveryBoyId\": \"{{deliveryBoyId}}\",\n  \"date\": \"2024-10-18\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/invoices/daily",
          "host": ["{{baseUrl}}"],
          "path": ["invoices", "daily"]
        }
      }
    },
    {
      "name": "Get All Invoices",
      "request": {
        "method": "GET",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "url": {
          "raw": "{{baseUrl}}/invoices",
          "host": ["{{baseUrl}}"],
          "path": ["invoices"]
        }
      }
    }
  ],
  "variable": [
    {"key": "baseUrl", "value": "http://localhost:3000"}
  ]
}
```

## 10. Monitoring

### Check Scheduler Status

Add this endpoint to check if scheduler is running (optional enhancement):

```bash
curl -X GET http://localhost:3000/admin/scheduler-status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### View Logs

```bash
# Server logs
tail -f backend/logs/*.log

# Or console output
npm run dev
```

### Database Queries

```sql
-- Check invoices
SELECT * FROM invoices ORDER BY created_at DESC LIMIT 10;

-- Check WhatsApp messages
SELECT * FROM whatsapp_messages ORDER BY created_at DESC LIMIT 10;

-- Check users with OTPs
SELECT id, name, phone, otp, otp_expires_at FROM users WHERE otp IS NOT NULL;

-- Check delivery status changes
SELECT * FROM deliveries WHERE status IN ('delivered', 'failed') 
ORDER BY updated_at DESC LIMIT 10;
```

## Troubleshooting

### WhatsApp not sending messages

1. Check if WhatsApp is ready:
   ```bash
   curl http://localhost:3000/health
   ```

2. Check WhatsApp message log:
   ```sql
   SELECT * FROM whatsapp_messages WHERE status = 'failed';
   ```

3. Restart server to reinitialize WhatsApp

### PDFs not generating

1. Check directory permissions:
   ```bash
   ls -la backend/invoices/
   ```

2. Check if data exists:
   ```sql
   SELECT * FROM deliveries WHERE status = 'delivered' AND delivery_date = CURRENT_DATE;
   ```

### Scheduler not running

1. Check server logs for scheduler initialization
2. Verify system time is correct
3. Check if jobs are scheduled:
   ```bash
   # In server logs, look for:
   # "Scheduler initialized with jobs: ..."
   ```

## Notes

- Replace `YOUR_JWT_TOKEN` with actual JWT token from login
- Replace UUIDs with actual IDs from your database
- Ensure phone numbers include country code (e.g., 91 for India)
- OTP validity is 10 minutes
- Rate limits: 5 requests per 15 minutes for OTP endpoints
