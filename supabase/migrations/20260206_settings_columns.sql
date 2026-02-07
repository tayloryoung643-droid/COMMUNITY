-- Settings columns migration
-- Users table: privacy, notifications, bio
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_in_directory boolean DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_unit_on_bulletin boolean DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS allow_waves boolean DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_announcements boolean DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_packages boolean DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_events boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_messages boolean DEFAULT true;

-- Buildings table: city/state/zip/description
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS zip text;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS description text;
