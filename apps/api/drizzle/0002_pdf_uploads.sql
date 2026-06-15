-- TrueStock Database Schema - PDF Uploads
-- Migration for PDF BCTC upload feature

-- Uploads table for storing PDF upload records
CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  ticker VARCHAR(20) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_key VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL,
  extracted_data JSONB,
  error_message VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for uploads
CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_ticker ON uploads(ticker);
CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON uploads(created_at);
