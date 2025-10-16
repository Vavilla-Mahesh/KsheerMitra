-- Migration 004: WhatsApp Authentication, Google Maps Integration, and Delivery Areas

-- Add WhatsApp authentication and location fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_manual TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS area_id UUID;

-- Make email nullable for WhatsApp-only authentication
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Create unique index for WhatsApp number
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_whatsapp ON users(whatsapp_number) WHERE whatsapp_number IS NOT NULL;

-- Create indexes for location-based queries
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_area ON users(area_id) WHERE area_id IS NOT NULL;

-- Create OTP verification table
CREATE TABLE IF NOT EXISTS otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whatsapp_number VARCHAR(20) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attempts INTEGER DEFAULT 0
);

-- Indexes for OTP verifications
CREATE INDEX IF NOT EXISTS idx_otp_whatsapp ON otp_verifications(whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verifications(expires_at);

-- Create delivery_areas table for admin-defined zones
CREATE TABLE IF NOT EXISTS delivery_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    delivery_boy_id UUID REFERENCES users(id) ON DELETE SET NULL,
    polygon_coordinates TEXT NOT NULL, -- JSON array of lat/lng coordinates
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for delivery_areas
CREATE INDEX IF NOT EXISTS idx_delivery_areas_delivery_boy ON delivery_areas(delivery_boy_id);
CREATE INDEX IF NOT EXISTS idx_delivery_areas_active ON delivery_areas(is_active);

-- Create delivery_routes table for optimized routes
CREATE TABLE IF NOT EXISTS delivery_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_boy_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    route_date DATE NOT NULL,
    customer_ids TEXT NOT NULL, -- JSON array of customer IDs in optimized order
    route_data TEXT, -- JSON data from Google Directions API
    total_distance INTEGER, -- in meters
    estimated_duration INTEGER, -- in seconds
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for delivery_routes
CREATE INDEX IF NOT EXISTS idx_delivery_routes_delivery_boy ON delivery_routes(delivery_boy_id);
CREATE INDEX IF NOT EXISTS idx_delivery_routes_date ON delivery_routes(route_date);
CREATE INDEX IF NOT EXISTS idx_delivery_routes_status ON delivery_routes(status);

-- Create delivery_logs table for tracking individual delivery completion
CREATE TABLE IF NOT EXISTS delivery_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES delivery_routes(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delivery_order INTEGER NOT NULL, -- order in the route
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    completed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for delivery_logs
CREATE INDEX IF NOT EXISTS idx_delivery_logs_route ON delivery_logs(route_id);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_customer ON delivery_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_status ON delivery_logs(status);

-- Add foreign key for area_id
ALTER TABLE users ADD CONSTRAINT fk_users_area 
    FOREIGN KEY (area_id) REFERENCES delivery_areas(id) ON DELETE SET NULL;

-- Remove the unique constraint on delivery_boy role to allow multiple delivery boys
DROP INDEX IF EXISTS idx_unique_delivery_boy;

-- Triggers for updated_at
CREATE TRIGGER update_delivery_areas_updated_at 
BEFORE UPDATE ON delivery_areas 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_routes_updated_at 
BEFORE UPDATE ON delivery_routes 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_logs_updated_at 
BEFORE UPDATE ON delivery_logs 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
