-- Migration 004: WhatsApp OTP and Google Maps Integration

-- Add OTP fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP;

-- Add latitude and longitude to users table (if not exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Add area_id to users table for area assignment
ALTER TABLE users ADD COLUMN IF NOT EXISTS area_id UUID;

-- Update role enum to use new values
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid  
        WHERE t.typname = 'users_role_enum' AND e.enumlabel = 'DELIVERY'
    ) THEN
        ALTER TYPE users_role_enum RENAME TO users_role_enum_old;
        CREATE TYPE users_role_enum AS ENUM ('ADMIN', 'CUSTOMER', 'DELIVERY');
        ALTER TABLE users ALTER COLUMN role TYPE users_role_enum USING role::text::users_role_enum;
        DROP TYPE users_role_enum_old;
    END IF;
END$$;

-- Create delivery_status table (new model)
CREATE TABLE IF NOT EXISTS delivery_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_boy_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'DELIVERED', 'MISSED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for delivery_status
CREATE INDEX IF NOT EXISTS idx_delivery_status_delivery_boy ON delivery_status(delivery_boy_id);
CREATE INDEX IF NOT EXISTS idx_delivery_status_customer ON delivery_status(customer_id);
CREATE INDEX IF NOT EXISTS idx_delivery_status_subscription ON delivery_status(subscription_id);
CREATE INDEX IF NOT EXISTS idx_delivery_status_date ON delivery_status(date);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generated_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('DAILY', 'MONTHLY')),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    pdf_path TEXT,
    sent_via_whatsapp BOOLEAN DEFAULT false,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for invoices
CREATE INDEX IF NOT EXISTS idx_invoices_generated_by ON invoices(generated_by);
CREATE INDEX IF NOT EXISTS idx_invoices_target_user ON invoices(target_user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_type ON invoices(type);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date);

-- Create area_assignments table
CREATE TABLE IF NOT EXISTS area_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_boy_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    area_name VARCHAR(255) NOT NULL,
    customers UUID[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(delivery_boy_id)
);

-- Create indexes for area_assignments
CREATE INDEX IF NOT EXISTS idx_area_assignments_delivery_boy ON area_assignments(delivery_boy_id);

-- Update subscription type enum
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'subscription_type_enum'
    ) THEN
        CREATE TYPE subscription_type_enum AS ENUM ('MONTHLY', 'CUSTOM', 'SPECIFIC_DAYS');
        ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS type subscription_type_enum DEFAULT 'MONTHLY';
    END IF;
END$$;

-- Add triggers for updated_at
CREATE OR REPLACE TRIGGER update_delivery_status_updated_at 
BEFORE UPDATE ON delivery_status 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_invoices_updated_at 
BEFORE UPDATE ON invoices 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_area_assignments_updated_at 
BEFORE UPDATE ON area_assignments 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
