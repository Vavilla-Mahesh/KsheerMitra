-- Migration 002: Enhanced Features for Admin, Products, and Subscriptions

-- Add new fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive'));
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Add new fields to products table for image and category
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Add new fields to subscriptions table for flexible scheduling
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS schedule_type VARCHAR(50) DEFAULT 'daily' CHECK (schedule_type IN ('daily', 'weekly', 'custom'));
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS days_of_week TEXT; -- JSON array stored as text: ["Mon", "Wed", "Fri"]

-- Create subscription_items table for multi-product subscriptions
CREATE TABLE IF NOT EXISTS subscription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_per_unit DECIMAL(10, 2) NOT NULL CHECK (price_per_unit >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for subscription_items
CREATE INDEX IF NOT EXISTS idx_subscription_items_subscription ON subscription_items(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_items_product ON subscription_items(product_id);

-- Create delivery_status table for tracking delivery boy status
CREATE TABLE IF NOT EXISTS delivery_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_boy_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline')),
    location TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(delivery_boy_id)
);

-- Index for delivery_status
CREATE INDEX IF NOT EXISTS idx_delivery_status_delivery_boy ON delivery_status(delivery_boy_id);

-- Trigger for subscription_items updated_at
CREATE TRIGGER update_subscription_items_updated_at 
BEFORE UPDATE ON subscription_items 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for delivery_status updated_at
CREATE TRIGGER update_delivery_status_updated_at 
BEFORE UPDATE ON delivery_status 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
