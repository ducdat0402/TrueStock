-- TrueStock Database Schema - B2B API
-- Migration for B2B API keys and usage tracking

-- API Keys table for B2B clients
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id VARCHAR(255) NOT NULL,
  org_name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  key_prefix VARCHAR(20) NOT NULL,
  tier VARCHAR(20) DEFAULT 'standard' NOT NULL,
  rate_limit INTEGER DEFAULT 100 NOT NULL,
  monthly_quota INTEGER DEFAULT 1000 NOT NULL,
  is_active VARCHAR(5) DEFAULT 'true' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- API Usage Log for detailed tracking
CREATE TABLE IF NOT EXISTS api_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES api_keys(id) NOT NULL,
  endpoint VARCHAR(100) NOT NULL,
  ticker VARCHAR(20),
  response_time_ms INTEGER,
  status_code INTEGER,
  called_at TIMESTAMP DEFAULT NOW()
);

-- API Monthly Usage Summary
CREATE TABLE IF NOT EXISTS api_monthly_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES api_keys(id) NOT NULL,
  year_month VARCHAR(7) NOT NULL,
  call_count INTEGER DEFAULT 0 NOT NULL,
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(api_key_id, year_month)
);

-- Indexes for API tables
CREATE INDEX IF NOT EXISTS idx_api_keys_org_id ON api_keys(org_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_usage_log_api_key_id ON api_usage_log(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_log_called_at ON api_usage_log(called_at);
CREATE INDEX IF NOT EXISTS idx_api_monthly_usage_key_month ON api_monthly_usage(api_key_id, year_month);
