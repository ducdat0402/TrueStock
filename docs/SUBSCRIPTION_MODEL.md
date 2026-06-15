# TrueStock Subscription Model

## Overview

TrueStock implements a freemium subscription model with the following tiers:

## Pricing Tiers

### Free Tier
- **Price**: 0đ/month
- **Analysis Quota**: 3 analyses/day (cache hits don't count)
- **Features**:
  - Basic health score
  - AI-powered summary
  - CafeF data integration
- **Restrictions**:
  - Login required
  - No advanced insights (risk alerts, industry comparison, health history)
  - No watchlist
  - No alerts
  - No comparison feature

### Premium Tier
- **Price**: 99.000đ/month (~$4.99 USD)
- **Analysis Quota**: Unlimited
- **Features**:
  - Everything in Free
  - Advanced insights (risk alerts, industry comparison, health score history)
  - Watchlist/Portfolio tracking
  - Email + In-app alerts
  - Compare up to 5 stocks
  - PDF BCTC upload & analysis
  - Priority support

### B2B Tier
- **Price**: Custom pricing (contact sales)
- **Features**:
  - API access via `/v1/analyze`
  - X-API-Key authentication
  - Monthly quota metering
  - White-label support (custom branding)
  - Usage analytics

## Tech Stack Updates (vs Original Slides)

| Component | Original Slide | Current Implementation |
|-----------|---------------|----------------------|
| Backend Framework | NestJS | **Hono** (Cloudflare Workers) |
| Payment/Billing | RevenueCat | **Clerk Billing** (Stripe) |
| Database | PostgreSQL | PostgreSQL via **Neon** (serverless) |
| Authentication | Clerk | Clerk (unchanged) |
| AI | Claude | Claude (unchanged) |
| Storage | - | **Cloudflare R2** (for PDF uploads) |

## API Endpoints

### Consumer API (requires Clerk JWT)
- `POST /api/analyze` - Analyze a stock (quota enforced)
- `GET /api/me` - Get user info, plan, and usage
- `POST /api/compare` - Compare stocks (Premium only)
- `GET /api/watchlist` - Get watchlist (Premium only)
- `GET /api/alerts` - Get alerts (Premium only)
- `POST /api/upload/bctc` - Upload PDF (Premium only)

### B2B API (requires X-API-Key)
- `POST /v1/analyze` - Analyze a stock
- `GET /v1/usage` - Get API usage stats
- `GET /v1/health` - Health check

### Webhooks
- `POST /api/webhooks/clerk-billing` - Clerk subscription events

## Database Schema

### New Tables for Subscription
- `users.plan` - User plan (free/premium/b2b)
- `users.plan_expires_at` - Plan expiration
- `users.clerk_subscription_id` - Subscription tracking
- `usage_daily` - Daily quota tracking

### B2B Tables
- `api_keys` - API key storage
- `api_usage_log` - Detailed API call logs
- `api_monthly_usage` - Monthly aggregated usage

### Upload Tables
- `uploads` - PDF upload records

## Slide Updates Needed

### Tech Stack Slide
1. Replace "NestJS" with "Hono (Cloudflare Workers)"
2. Replace "RevenueCat" with "Clerk Billing (Stripe)"
3. Add "Cloudflare R2" for file storage

### Business Model Slide
1. Update Free tier: "Login required, 3 analyses/day"
2. Update Premium tier: "Compare up to 5 stocks" (not 3)
3. Add "PDF BCTC Upload" to Premium features
4. Mark B2B API as "Available" (was "Coming soon")

### Feature Comparison Table
| Feature | Free | Premium | B2B |
|---------|------|---------|-----|
| Basic Analysis | ✓ (3/day) | Unlimited | Unlimited |
| Advanced Insights | ✗ | ✓ | ✓ |
| Watchlist | ✗ | ✓ | - |
| Alerts | ✗ | ✓ | - |
| Compare Stocks | ✗ | Up to 5 | - |
| PDF Upload | ✗ | ✓ | - |
| API Access | ✗ | ✗ | ✓ |
| White-label | ✗ | ✗ | ✓ |

## Environment Variables

### Required Secrets (Cloudflare Workers)
```bash
wrangler secret put ANTHROPIC_API_KEY --env production
wrangler secret put DATABASE_URL --env production
wrangler secret put CLERK_SECRET_KEY --env production
wrangler secret put CLERK_WEBHOOK_SECRET --env production
wrangler secret put RESEND_API_KEY --env production
```

### R2 Bucket Setup
```bash
wrangler r2 bucket create truestock-uploads
```

## Migrations

Run these SQL migrations in order:
1. `0000_initial_schema.sql` - Base tables
2. `0001_subscription_schema.sql` - Plan + usage tracking
3. `0002_pdf_uploads.sql` - Upload records
4. `0003_b2b_api.sql` - B2B API tables
