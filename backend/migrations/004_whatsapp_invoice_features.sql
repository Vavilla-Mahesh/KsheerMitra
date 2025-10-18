-- Migration 004: WhatsApp Integration and Invoice Features

-- Add OTP column to users table for WhatsApp OTP authentication
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP;

-- Add latitude and longitude for location tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Create invoices table for tracking daily and monthly invoices
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generated_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('DAILY', 'MONTHLY')),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    pdf_path TEXT,
    sent_via_whatsapp BOOLEAN DEFAULT false,
    invoice_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for invoices
CREATE INDEX IF NOT EXISTS idx_invoices_generated_by ON invoices(generated_by);
CREATE INDEX IF NOT EXISTS idx_invoices_target_user ON invoices(target_user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_type ON invoices(type);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_sent ON invoices(sent_via_whatsapp);

-- Create area_assignments table for delivery boy area management
CREATE TABLE IF NOT EXISTS area_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_boy_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    area_name VARCHAR(255) NOT NULL,
    customers JSONB, -- Array of customer UUIDs stored as JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(delivery_boy_id)
);

-- Index for area_assignments
CREATE INDEX IF NOT EXISTS idx_area_assignments_delivery_boy ON area_assignments(delivery_boy_id);

-- Create whatsapp_messages table for tracking sent messages
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_phone VARCHAR(20) NOT NULL,
    message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('OTP', 'DELIVERY_STATUS', 'DAILY_INVOICE', 'MONTHLY_INVOICE')),
    message_content TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    sent_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for whatsapp_messages
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON whatsapp_messages(recipient_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_type ON whatsapp_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created ON whatsapp_messages(created_at);

-- Add trigger for invoices updated_at
CREATE TRIGGER update_invoices_updated_at 
BEFORE UPDATE ON invoices 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for area_assignments updated_at
CREATE TRIGGER update_area_assignments_updated_at 
BEFORE UPDATE ON area_assignments 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
