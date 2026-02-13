-- Add contact info columns to bulletin_listings table
ALTER TABLE bulletin_listings ADD COLUMN IF NOT EXISTS contact_email text DEFAULT NULL;
ALTER TABLE bulletin_listings ADD COLUMN IF NOT EXISTS contact_phone text DEFAULT NULL;
