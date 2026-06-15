-- TrueStock Database Schema - Subscription Model
-- Migration for user plans and usage tracking

-- Add plan columns to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS plan VARCHAR(20) DEFAULT 'free' NOT NULL,
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS clerk_subscription_id VARCHAR(255);

-- Usage daily table - track daily quota usage
CREATE TABLE IF NOT EXISTS usage_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  date DATE NOT NULL,
  analyze_count INTEGER DEFAULT 0 NOT NULL,
  compare_count INTEGER DEFAULT 0 NOT NULL,
  UNIQUE(user_id, date)
);

-- Indexes for usage_daily
CREATE INDEX IF NOT EXISTS idx_usage_daily_user_date ON usage_daily(user_id, date);
