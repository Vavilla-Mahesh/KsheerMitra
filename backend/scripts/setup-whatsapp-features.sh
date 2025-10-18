#!/bin/bash

# WhatsApp and Invoice Features Setup Script
# This script applies the new migration for WhatsApp integration and invoice features

set -e

echo "====================================="
echo "KsheerMitra WhatsApp & Invoice Setup"
echo "====================================="
echo ""

# Check if PostgreSQL is available
if ! command -v psql &> /dev/null; then
    echo "Error: PostgreSQL is not installed or not in PATH"
    exit 1
fi

# Get database connection details
if [ -f .env ]; then
    echo "Loading database configuration from .env..."
    export $(grep -v '^#' .env | xargs)
else
    echo "Warning: .env file not found"
    read -p "Enter database name (default: ksheermitra): " DB_NAME
    DB_NAME=${DB_NAME:-ksheermitra}
    read -p "Enter database host (default: localhost): " DB_HOST
    DB_HOST=${DB_HOST:-localhost}
    read -p "Enter database port (default: 5432): " DB_PORT
    DB_PORT=${DB_PORT:-5432}
    read -p "Enter database user (default: postgres): " DB_USER
    DB_USER=${DB_USER:-postgres}
fi

DB_NAME=${DB_NAME:-ksheermitra}

echo ""
echo "Applying migration 004_whatsapp_invoice_features.sql..."
echo ""

# Apply migration
PGPASSWORD=$DB_PASSWORD psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d $DB_NAME -f migrations/004_whatsapp_invoice_features.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration applied successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update your .env file with GOOGLE_MAPS_API_KEY (optional)"
    echo "2. Start the server with 'npm start' or 'npm run dev'"
    echo "3. Scan the WhatsApp QR code when it appears"
    echo "4. Test the new features:"
    echo "   - OTP authentication: POST /otp/send"
    echo "   - Invoice generation: POST /invoices/daily"
    echo "   - Delivery status updates trigger WhatsApp messages"
    echo ""
    echo "For detailed documentation, see:"
    echo "- WHATSAPP_INVOICE_IMPLEMENTATION.md"
    echo "- backend/README.md"
    echo ""
else
    echo ""
    echo "❌ Migration failed!"
    echo "Please check the error message above."
    exit 1
fi
