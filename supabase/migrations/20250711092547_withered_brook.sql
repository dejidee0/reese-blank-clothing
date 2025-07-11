/*
  # Update Orders Table for Multi-Currency Support

  1. Changes
    - Add currency column to orders table
    - Add default currency as NGN
    - Update existing orders to have NGN currency

  2. Security
    - Maintain existing RLS policies
*/

-- Add currency column to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'currency'
  ) THEN
    ALTER TABLE orders ADD COLUMN currency text DEFAULT 'NGN' CHECK (currency IN ('NGN', 'USD'));
  END IF;
END $$;

-- Update existing orders to have NGN currency
UPDATE orders SET currency = 'NGN' WHERE currency IS NULL;