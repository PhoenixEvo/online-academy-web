# Hướng dẫn Deploy Online Academy lên Host

Dự án này có thể được deploy lên các platform sau:
- **Heroku** (Recommended)
- **Railway**
- **Render**
- **Fly.io**

## 📋 Yêu cầu trước khi deploy

1. Có tài khoản trên platform bạn chọn
2. Database PostgreSQL đã được setup (có thể dùng Supabase, Railway PostgreSQL, hoặc Heroku Postgres)
3. Git repository đã được commit và push lên GitHub/GitLab

---

## 🚀 Deploy lên Heroku

### Bước 1: Cài đặt Heroku CLI
```bash
# Windows
# Download từ: https://devcenter.heroku.com/articles/heroku-cli

# MacOS
brew tap heroku/brew && brew install heroku

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

### Bước 2: Login và tạo app
```bash
heroku login
heroku create your-app-name
```

### Bước 3: Thêm PostgreSQL addon
```bash
heroku addons:create heroku-postgresql:mini
```

### Bước 4: Set environment variables
```bash
# Database URL sẽ tự động được set bởi Heroku Postgres
# Bạn chỉ cần set các biến khác:

heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=your-super-secret-session-key-change-this
heroku config:set MAIL_HOST=smtp.gmail.com
heroku config:set MAIL_PORT=587
heroku config:set MAIL_USER=your-email@gmail.com
heroku config:set MAIL_PASS=your-app-password
heroku config:set MAIL_FROM="Mentor Online Academy <no-reply@yourdomain.com>"

# Google OAuth (nếu dùng)
heroku config:set GOOGLE_CLIENT_ID=your-google-client-id
heroku config:set GOOGLE_CLIENT_SECRET=your-google-client-secret
heroku config:set GOOGLE_CALLBACK_URL=https://your-app-name.herokuapp.com/auth/google/callback

# Supabase (nếu dùng cho storage)
heroku config:set SUPABASE_URL=your-supabase-url
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
heroku config:set SUPABASE_ANON_KEY=your-anon-key
heroku config:set SUPABASE_BUCKET=your-bucket-name
```

### Bước 5: Deploy code
```bash
git push heroku main
# hoặc
git push heroku master
```

### Bước 6: Chạy migrations
```bash
heroku run npm run migrate
heroku run npm run seed  # Chỉ chạy lần đầu
```

### Bước 7: Mở app
```bash
heroku open
```

### Bước 8: Xem logs (nếu có lỗi)
```bash
heroku logs --tail
```

---

## 🚂 Deploy lên Railway

### Bước 1: Kết nối GitHub repo
1. Đăng nhập Railway: https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Chọn repository của bạn

### Bước 2: Thêm PostgreSQL Database
1. Trong project, click "New" → "Database" → "PostgreSQL"
2. Railway sẽ tự động tạo DATABASE_URL

### Bước 3: Set Environment Variables
Trong tab "Variables", thêm các biến sau:
```
NODE_ENV=production
SESSION_SECRET=your-super-secret-session-key-change-this
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM="Mentor Online Academy <no-reply@yourdomain.com>"
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-app-name.up.railway.app/auth/google/callback
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_BUCKET=your-bucket-name
```

### Bước 4: Set Build & Start Commands
Trong tab "Settings" → "Deploy":
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Bước 5: Deploy
Railway sẽ tự động deploy khi bạn push code lên GitHub.

### Bước 6: Chạy migrations
Trong Railway dashboard, mở "Deployments" → click vào deployment mới nhất → mở "View Logs" → chạy:
```bash
npm run migrate
npm run seed  # Chỉ chạy lần đầu
```

---

## 🎨 Deploy lên Render (Recommended)

### Cách 1: Sử dụng render.yaml (Khuyến nghị)

Render hỗ trợ file `render.yaml` để tự động cấu hình. File này đã được tạo sẵn trong project.

### Bước 1: Đăng nhập và kết nối GitHub
1. Đăng nhập Render: https://render.com
2. Click "New" → "Blueprint"
3. Kết nối GitHub repository chứa project
4. Render sẽ tự động detect file `render.yaml` và cấu hình

### Bước 2: Cập nhật Environment Variables
Sau khi blueprint được tạo, vào **Dashboard** → chọn service → **Environment**:

**Bắt buộc phải set:**
```
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password  # Gmail App Password, không phải password thường
MAIL_FROM="Mentor Online Academy <no-reply@yourdomain.com>"
```

**Nếu dùng Google OAuth:**
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-app-name.onrender.com/auth/google/callback
```

**Nếu dùng Supabase:**
```
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_BUCKET=your-bucket-name
```

### Bước 3: Chạy Migrations
Sau khi deploy thành công:
1. Vào service → **Shell**
2. Chạy:
```bash
npm run migrate
npm run seed  # Chỉ chạy lần đầu
```

### Cách 2: Deploy thủ công (không dùng render.yaml)

### Bước 1: Tạo Web Service
1. Đăng nhập Render: https://render.com
2. Click "New" → "Web Service"
3. Kết nối GitHub repository

### Bước 2: Cấu hình Web Service
- **Name**: `online-academy` (hoặc tên bạn muốn)
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free (hoặc Paid nếu cần)

### Bước 3: Tạo PostgreSQL Database
1. Trong cùng Dashboard, click "New" → "PostgreSQL"
2. **Name**: `online-academy-db`
3. **Plan**: Free (hoặc Paid)
4. **Database**: `online_academy`
5. Render sẽ tự động tạo và set `DATABASE_URL` cho web service

### Bước 4: Link Database với Web Service
1. Vào Web Service → **Environment**
2. Click "Link Database" → chọn database vừa tạo
3. `DATABASE_URL` sẽ được tự động thêm

### Bước 5: Set Environment Variables
Trong tab **Environment** của Web Service, thêm:

**Bắt buộc:**
```
NODE_ENV=production
SESSION_SECRET=your-super-secret-session-key-minimum-32-characters
PORT=10000  # Render sẽ tự động set, nhưng có thể set để chắc chắn
```

**Email (bắt buộc cho OTP):**
```
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-gmail-app-password
MAIL_FROM="Mentor Online Academy <no-reply@yourdomain.com>"
```

**Google OAuth (tùy chọn):**
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-app-name.onrender.com/auth/google/callback
```

**Supabase (nếu dùng cho storage):**
```
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_BUCKET=your-bucket-name
```

### Bước 6: Deploy
1. Click "Save Changes"
2. Render sẽ tự động deploy
3. Đợi build và deploy hoàn tất (khoảng 5-10 phút lần đầu)

### Bước 7: Chạy Migrations
1. Vào Web Service → **Shell** (hoặc **Logs**)
2. Hoặc dùng Render Dashboard → **Shell** tab
3. Chạy:
```bash
npm run migrate
npm run seed  # Chỉ chạy lần đầu để seed dữ liệu
```

### Bước 8: Kiểm tra
1. Click URL của service (dạng: `https://your-app-name.onrender.com`)
2. Test các chức năng chính

### Lưu ý Render:
- **Free tier** có thể sleep sau 15 phút không hoạt động (lần đầu wake up sẽ mất vài giây)
- **Database Free tier** sẽ bị xóa sau 90 ngày không dùng
- **Logs** có thể xem trong Dashboard → **Logs** tab
- **Custom domain** có thể setup trong **Settings** → **Custom Domain**

---

## 🔧 Cấu hình quan trọng

### 1. Google OAuth Callback URL
Khi deploy, nhớ update Google OAuth callback URL trong Google Cloud Console:
- Heroku: `https://your-app-name.herokuapp.com/auth/google/callback`
- Railway: `https://your-app-name.up.railway.app/auth/google/callback`
- **Render**: `https://your-app-name.onrender.com/auth/google/callback` ⚠️ **QUAN TRỌNG**

### 2. Session Cookie
Đảm bảo set `secure: true` trong session config khi deploy production:
```javascript
cookie: {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production', // true khi deploy
  maxAge: 1000 * 60 * 60 * 4,
}
```

### 3. CORS và CSP
Kiểm tra lại CSP headers trong `src/app.js` để đảm bảo các domain external được phép.

---

## 📝 Kiểm tra sau khi deploy

1. ✅ Homepage load được
2. ✅ Đăng ký tài khoản mới hoạt động
3. ✅ OTP email được gửi
4. ✅ Đăng nhập hoạt động
5. ✅ Upload file hoạt động (nếu dùng Supabase)
6. ✅ Database migrations đã chạy
7. ✅ Static files (CSS, JS, images) load được

---

## 🐛 Troubleshooting

### Lỗi: "Cannot find module"
```bash
# Chạy lại npm install trên server
heroku run npm install
```

### Lỗi: Database connection
- Kiểm tra DATABASE_URL đã được set chưa
- Kiểm tra SSL connection settings

### Lỗi: Static files không load
- Kiểm tra đường dẫn trong views có đúng `/css/`, `/js/` không
- Kiểm tra `express.static` middleware

### Lỗi: Session không persist
- Kiểm tra SESSION_SECRET đã được set
- Kiểm tra database table `user_sessions` đã được tạo

---

## 📚 Tài liệu tham khảo

- [Heroku Node.js Guide](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)

---

**Lưu ý**: File `.env` không được commit lên Git. Tất cả secrets phải được set qua environment variables trên platform.

