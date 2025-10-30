# ✅ Deployment Checklist - Render

## Trước khi deploy

- [ ] Đã commit và push code lên GitHub (bao gồm file `render.yaml`)
- [ ] Đã có tài khoản Render: https://render.com
- [ ] Đã có các thông tin cần thiết:
  - [ ] Email SMTP credentials (MAIL_HOST, MAIL_USER, MAIL_PASS)
  - [ ] Google OAuth credentials (nếu dùng)
  - [ ] Supabase credentials (nếu dùng cho storage)

## Files đã được tạo

- [x] `render.yaml` - Render Blueprint configuration
- [x] `RENDER_DEPLOY.md` - Hướng dẫn chi tiết deploy Render
- [x] `package.json` script `start` đã được sửa thành `node src/app.js`

## Environment Variables cần set trong Render Dashboard

**Lưu ý**: Các biến `NODE_ENV`, `SESSION_SECRET`, `DATABASE_URL` sẽ được tự động set bởi `render.yaml`. Bạn chỉ cần set các biến sau:

### Email (bắt buộc cho OTP - phải set thủ công):
- [ ] `MAIL_HOST` (ví dụ: smtp.gmail.com)
- [ ] `MAIL_PORT` (ví dụ: 587)
- [ ] `MAIL_USER` (email của bạn)
- [ ] `MAIL_PASS` (app password, không phải password thường)
- [ ] `MAIL_FROM` (ví dụ: "Mentor Online Academy <no-reply@yourdomain.com>")

### Google OAuth (tùy chọn):
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `GOOGLE_CALLBACK_URL` (phải match với domain deploy)

### Supabase (nếu dùng cho storage):
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `SUPABASE_BUCKET`

## Sau khi deploy lên Render

- [ ] Vào Render Dashboard → Web Service → **Shell** tab
- [ ] Chạy migrations: `npm run migrate`
- [ ] Chạy seeds (chỉ lần đầu): `npm run seed`
- [ ] Kiểm tra app hoạt động: mở URL `https://your-app-name.onrender.com`
- [ ] Test các chức năng chính:
  - [ ] Homepage load được
  - [ ] Đăng ký tài khoản mới
  - [ ] Nhận và verify OTP email
  - [ ] Đăng nhập
  - [ ] Session persist (refresh vẫn đăng nhập)
  - [ ] Upload file (nếu dùng Supabase)
  - [ ] Database queries hoạt động (xem courses, categories)

## Troubleshooting Render

Nếu gặp lỗi, kiểm tra:
- [ ] **Logs** tab trong Render Dashboard xem có lỗi gì
- [ ] Environment variables đã được set đúng chưa (Web Service → Environment)
- [ ] Database đã được link với web service chưa
- [ ] `MAIL_PASS` là Gmail App Password (16 ký tự), không phải password thường
- [ ] Google OAuth callback URL đã được update trong Google Cloud Console thành `https://your-app-name.onrender.com/auth/google/callback`
- [ ] App có thể đang sleep (free tier), đợi 30-60 giây

---

## Quick Steps để deploy

1. **Push code lên GitHub** (có file `render.yaml`)
2. **Render Dashboard** → "New" → "Blueprint" → Connect GitHub repo
3. **Set Environment Variables** trong Web Service → Environment tab
4. **Chờ deploy** (5-10 phút)
5. **Chạy migrations** trong Shell tab: `npm run migrate` và `npm run seed`
6. **Test app** tại URL được cung cấp

---

**Lưu ý quan trọng**: 
- Không commit file `.env` lên Git
- Tất cả secrets phải được set qua environment variables trên Render Dashboard
- Test kỹ các chức năng sau khi deploy
- **Gmail App Password**: Phải tạo trong Google Account → Security → App passwords (không dùng password thường)

