-- TrueStock Database Schema
-- Initial migration

-- Users table - lưu thông tin user từ Clerk
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Analyses table - cache kết quả phân tích cổ phiếu
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker VARCHAR(20) NOT NULL,
  company_name VARCHAR(255),
  health_score DECIMAL(3,1),
  raw_financial_data JSONB,
  ai_result JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Search history table - lịch sử tìm kiếm của user
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  ticker VARCHAR(20) NOT NULL,
  analysis_id UUID REFERENCES analyses(id),
  searched_at TIMESTAMP DEFAULT NOW()
);

-- Indexes để tối ưu query
CREATE INDEX IF NOT EXISTS idx_analyses_ticker ON analyses(ticker);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_searched_at ON search_history(searched_at);
