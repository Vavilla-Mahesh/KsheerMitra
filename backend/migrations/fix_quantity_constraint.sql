-- Quick fix: Update the quantity_per_day constraint to allow 0 values
-- Run this in your PostgreSQL database

-- Drop the existing check constraint
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_quantity_per_day_check;

-- Add a new check constraint that allows 0 or positive values (instead of requiring > 0)
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_quantity_per_day_check CHECK (quantity_per_day >= 0);

-- Verify the changes
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'subscriptions'::regclass
AND conname LIKE '%quantity%';

