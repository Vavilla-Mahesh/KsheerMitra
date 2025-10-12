-- Migration 003: Make product_id nullable in subscriptions table
-- This allows multi-product subscriptions where products are stored in subscription_items

-- Make product_id nullable to support multi-product subscriptions
ALTER TABLE subscriptions ALTER COLUMN product_id DROP NOT NULL;

-- Make quantity_per_day nullable as well since it's not used in multi-product subscriptions
ALTER TABLE subscriptions ALTER COLUMN quantity_per_day DROP NOT NULL;

-- Drop the check constraint on quantity_per_day since it can be 0 for multi-product subscriptions
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_quantity_per_day_check;

-- Add a new check constraint that allows 0 or positive values
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_quantity_per_day_check CHECK (quantity_per_day >= 0);

-- Add a check constraint to ensure either product_id is set OR subscription has items
-- This will be enforced at the application level for now
