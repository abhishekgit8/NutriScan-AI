-- Migration: Add health tags to user_profiles and risk_tier to scan_history
-- Run this in your Supabase SQL Editor

-- Add health_tags column to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS health_tags TEXT[] DEFAULT '{}';

-- Add risk_tier column to scan_history
ALTER TABLE scan_history
ADD COLUMN IF NOT EXISTS risk_tier TEXT DEFAULT 'safe';

-- Add risk_tier column to cached_products
ALTER TABLE cached_products
ADD COLUMN IF NOT EXISTS risk_tier TEXT DEFAULT 'safe';

-- Update RLS policies (no changes needed, existing policies cover new columns)
