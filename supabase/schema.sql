-- NutriScan AI Database Schema
-- Run this in your Supabase SQL Editor

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  preferences TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cached products table
CREATE TABLE IF NOT EXISTS cached_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barcode TEXT UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  ingredients_text TEXT,
  analysis TEXT,
  health_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scan history table
CREATE TABLE IF NOT EXISTS scan_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  barcode TEXT NOT NULL,
  product_name TEXT NOT NULL,
  health_score INTEGER NOT NULL,
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_id ON user_profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_cached_products_barcode ON cached_products(barcode);
CREATE INDEX IF NOT EXISTS idx_scan_history_clerk_id ON scan_history(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_scanned_at ON scan_history(scanned_at DESC);

-- Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid()::text = clerk_user_id);

-- Policies for cached_products (public read, authenticated write)
CREATE POLICY "Anyone can read cached products"
  ON cached_products FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert cached products"
  ON cached_products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update cached products"
  ON cached_products FOR UPDATE
  USING (true);

-- Policies for scan_history
CREATE POLICY "Users can view own scan history"
  ON scan_history FOR SELECT
  USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can insert own scan history"
  ON scan_history FOR INSERT
  WITH CHECK (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can delete own scan history"
  ON scan_history FOR DELETE
  USING (auth.uid()::text = clerk_user_id);
