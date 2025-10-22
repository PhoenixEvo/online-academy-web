# Setup Full-Text Search

## Bước 1: Chạy Migration

### Local Development (PostgreSQL local)
```bash
npm run migrate:latest
```

### Supabase (Production)

**Option 1: Chạy migration qua Knex**
```bash
# Set connection string to Supabase
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run migration
npm run migrate:latest
```

**Option 2: Chạy trực tiếp trong Supabase SQL Editor**

1. Vào Supabase Dashboard → SQL Editor
2. Tạo New Query
3. Paste code sau và chạy:

```sql
-- Create GIN index for full-text search on courses table
CREATE INDEX IF NOT EXISTS idx_courses_fulltext_search 
ON courses 
USING GIN (
  to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(short_desc, ''))
);

-- Create GIN index for category names
CREATE INDEX IF NOT EXISTS idx_categories_fulltext_search 
ON categories 
USING GIN (
  to_tsvector('english', COALESCE(name, ''))
);
```

4. Click **Run** để execute

## Bước 2: Verify Index được tạo

Chạy query này trong Supabase SQL Editor:

```sql
-- Check if indexes exist
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE indexname IN ('idx_courses_fulltext_search', 'idx_categories_fulltext_search');
```

Kết quả phải show 2 indexes.

## Bước 3: Test Full-Text Search

```sql
-- Test search with full-text
SELECT 
    title,
    short_desc,
    ts_rank(
        to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(short_desc, '')),
        plainto_tsquery('english', 'web')
    ) as rank
FROM courses
WHERE 
    to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(short_desc, ''))
    @@ plainto_tsquery('english', 'web')
ORDER BY rank DESC;
```

## Troubleshooting

### Nếu search vẫn không hoạt động:

1. **Kiểm tra có dữ liệu không:**
   ```sql
   SELECT COUNT(*) FROM courses WHERE status = 'published';
   ```

2. **Kiểm tra route:**
   - URL phải là: `/courses/search?q=your-search-term`
   - Form trong header đã có `action="/courses/search"` và `name="q"`

3. **Xem log lỗi trong console:**
   ```bash
   npm run dev
   ```
   Sau đó search và xem log

4. **Test search trực tiếp:**
   Truy cập: `http://localhost:3000/courses/search?q=web`

## Performance

Với GIN index:
- Search < 10,000 courses: ~10-50ms
- Search > 100,000 courses: ~100-200ms

Không có index:
- Search có thể mất 1-5 giây với database lớn

