# Hướng dẫn thiết lập Database

## 1. Tạo database trên Neon

1. Truy cập https://neon.tech và đăng nhập
2. Tạo project mới với tên "truestock"
3. Copy connection string (DATABASE_URL)

## 2. Cấu hình environment variables

Copy file `.dev.vars.example` thành `.dev.vars`:

```bash
cp .dev.vars.example .dev.vars
```

Điền DATABASE_URL vào file `.dev.vars`:

```
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

## 3. Chạy migration

Có 2 cách để tạo tables:

### Cách 1: Dùng Drizzle Push (nhanh, cho development)

```bash
pnpm db:push
```

### Cách 2: Chạy SQL trực tiếp trên Neon Console

1. Vào Neon Dashboard → SQL Editor
2. Copy nội dung file `drizzle/0000_initial_schema.sql`
3. Paste và chạy

## 4. Kiểm tra

Sau khi chạy migration, kiểm tra tables đã được tạo:

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

Kết quả mong đợi:
- users
- analyses  
- search_history

## Database Schema

```
users
├── id (UUID, PK)
├── clerk_id (VARCHAR, UNIQUE)
├── email (VARCHAR)
└── created_at (TIMESTAMP)

analyses
├── id (UUID, PK)
├── ticker (VARCHAR)
├── company_name (VARCHAR)
├── health_score (DECIMAL)
├── raw_financial_data (JSONB)
├── ai_result (JSONB)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

search_history
├── id (UUID, PK)
├── user_id (UUID, FK → users.id)
├── ticker (VARCHAR)
├── analysis_id (UUID, FK → analyses.id)
└── searched_at (TIMESTAMP)
```
