# 🚀 Hướng dẫn Deploy lên Render

## Phương pháp 1: Dùng Blueprint (render.yaml) - Khuyến nghị ⭐

### Bước 1: Chuẩn bị
1. **Push code lên GitHub** (đảm bảo có file `render.yaml` trong repo)
2. Đăng nhập Render: https://render.com
3. Đăng ký tài khoản (nếu chưa có) - có thể dùng GitHub account

### Bước 2: Tạo Blueprint
1. Click **"New"** → **"Blueprint"**
2. Chọn **"Public Git repository"** hoặc connect GitHub
3. Paste URL repository của bạn hoặc chọn từ GitHub
4. Render sẽ tự động detect file `render.yaml`
5. Click **"Apply"**

### Bước 3: Cấu hình Environment Variables
Sau khi blueprint được tạo, bạn sẽ thấy Web Service và Database được tạo sẵn.

**Vào Web Service → Environment tab, set các biến sau:**

#### Bắt buộc (Email cho OTP):
```
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-gmail-app-password
MAIL_FROM="Mentor Online Academy <no-reply@yourdomain.com>"
```

**Lưu ý**: `MAIL_PASS` phải là **Gmail App Password**, không phải password thường:
- Vào Google Account → Security → 2-Step Verification → App passwords
- Tạo App Password cho "Mail"
- Copy password (16 ký tự) và dùng làm `MAIL_PASS`

#### Tùy chọn (Google OAuth):
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-app-name.onrender.com/auth/google/callback
```

#### Tùy chọn (Supabase Storage):
```
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_BUCKET=your-bucket-name
```

### Bước 4: Chờ Deploy
- Render sẽ tự động build và deploy
- Lần đầu có thể mất 5-10 phút
- Xem progress trong **Logs** tab

### Bước 5: Chạy Migrations
Sau khi deploy thành công (status = "Live"):

1. Vào Web Service → **Shell** tab
2. Chạy lệnh:
```bash
npm run migrate
```
3. Chạy seed (chỉ lần đầu):
```bash
npm run seed
```

### Bước 6: Kiểm tra
1. Click vào URL của service (dạng: `https://your-app-name.onrender.com`)
2. Test các chức năng:
   - ✅ Homepage load được
   - ✅ Đăng ký tài khoản
   - ✅ Nhận email OTP
   - ✅ Đăng nhập
   - ✅ Upload file (nếu dùng Supabase)

---

## Phương pháp 2: Deploy thủ công (không dùng render.yaml)

### Bước 1: Tạo Web Service
1. Render Dashboard → **"New"** → **"Web Service"**
2. Connect GitHub repository
3. Chọn branch (thường là `main` hoặc `master`)

### Bước 2: Cấu hình Service
- **Name**: `online-academy` (hoặc tên bạn muốn)
- **Region**: Chọn gần bạn nhất (ví dụ: Singapore)
- **Branch**: `main` (hoặc branch bạn muốn deploy)
- **Root Directory**: Để trống (hoặc `online-academy` nếu repo có nhiều folders)
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: **Free** (hoặc Paid nếu cần)

### Bước 3: Tạo PostgreSQL Database
1. Render Dashboard → **"New"** → **"PostgreSQL"**
2. **Name**: `online-academy-db`
3. **Database**: `online_academy`
4. **User**: `online_academy_user` (tự động)
5. **Plan**: **Free** (hoặc Paid)
6. Click **"Create Database"**

### Bước 4: Link Database với Web Service
1. Vào Web Service → **Environment** tab
2. Scroll xuống phần **"Link Database"**
3. Chọn database `online-academy-db` vừa tạo
4. Click **"Link"**
5. `DATABASE_URL` sẽ được tự động thêm vào Environment Variables

### Bước 5: Set Environment Variables
Trong **Environment** tab của Web Service, thêm các biến:

**Bắt buộc:**
```
NODE_ENV=production
SESSION_SECRET=your-super-secret-session-key-minimum-32-characters-long
PORT=10000
```

**Email (bắt buộc):**
```
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-gmail-app-password
MAIL_FROM="Mentor Online Academy <no-reply@yourdomain.com>"
```

**Google OAuth (nếu dùng):**
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-app-name.onrender.com/auth/google/callback
```

**Supabase (nếu dùng):**
```
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_BUCKET=your-bucket-name
```

### Bước 6: Save và Deploy
1. Click **"Save Changes"** ở cuối trang
2. Render sẽ tự động bắt đầu deploy
3. Xem progress trong **Events** tab
4. Xem logs trong **Logs** tab

### Bước 7: Chạy Migrations
1. Vào **Shell** tab (bên cạnh Logs)
2. Chạy:
```bash
npm run migrate
npm run seed  # Chỉ chạy lần đầu
```

---

## ⚠️ Lưu ý quan trọng cho Render

### 1. Free Tier Limitations
- **Sleep mode**: Free tier sẽ sleep sau 15 phút không có traffic
- **Wake up**: Lần đầu wake up sau khi sleep có thể mất 30-60 giây
- **Database**: Free tier database sẽ bị xóa sau 90 ngày không dùng
- **Bandwidth**: Free tier có giới hạn bandwidth

### 2. Google OAuth Callback URL
Sau khi deploy, **NHỚ** update callback URL trong Google Cloud Console:
```
https://your-app-name.onrender.com/auth/google/callback
```

### 3. Gmail App Password
Không thể dùng password thường của Gmail. Phải tạo App Password:
1. Vào Google Account → Security
2. Bật 2-Step Verification (nếu chưa bật)
3. Vào "App passwords"
4. Tạo password cho "Mail"
5. Copy 16 ký tự và dùng làm `MAIL_PASS`

### 4. Database Connection
- `DATABASE_URL` sẽ được tự động set khi link database
- Không cần set thủ công
- Render tự động config SSL

### 5. View Logs
Nếu có lỗi, xem logs:
- **Logs** tab: Xem real-time logs
- **Events** tab: Xem deployment events
- **Shell** tab: SSH vào container để debug

---

## 🔍 Troubleshooting

### Lỗi: "Cannot connect to database"
- Kiểm tra database đã được link với web service chưa
- Kiểm tra `DATABASE_URL` có trong Environment Variables

### Lỗi: "Email send failed"
- Kiểm tra `MAIL_PASS` là App Password (16 ký tự)
- Kiểm tra Gmail đã bật "Less secure app access" (không cần với App Password)
- Kiểm tra `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER` đúng chưa

### Lỗi: "Module not found"
- Kiểm tra `package.json` có đầy đủ dependencies
- Kiểm tra build logs xem `npm install` có chạy thành công

### App chậm hoặc không response
- Free tier có thể đang sleep, đợi 30-60 giây
- Kiểm tra logs xem có lỗi gì

### Migrations không chạy
- Vào Shell tab và chạy thủ công:
```bash
npm run migrate
```

---

## ✅ Checklist sau khi deploy

- [ ] App URL mở được và load homepage
- [ ] Đăng ký tài khoản mới hoạt động
- [ ] Email OTP được gửi và nhận được
- [ ] Đăng nhập hoạt động
- [ ] Session persist (đăng nhập rồi refresh vẫn đăng nhập)
- [ ] Upload file hoạt động (nếu dùng Supabase)
- [ ] Database queries hoạt động (xem courses, categories)
- [ ] Static files (CSS, JS, images) load được

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Xem **Logs** tab để debug
2. Kiểm tra **Environment Variables** đã set đúng chưa
3. Kiểm tra database connection trong **Shell**:
   ```bash
   echo $DATABASE_URL
   ```

**Chúc bạn deploy thành công! 🎉**

