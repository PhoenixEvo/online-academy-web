---
title: PTUDW - Final Project - Online Academy
tags: [PTUDW-LT, project]

---

---
title: 'PTUDW - Final Project - Online Academy'
---

<style>
  div p {
    text-align: justify;
    text-justify: inter-word;
  }
  
  mark {
    background: none !important;
    font-family: monospace;
    color: #c0341d;
    font-weight: bold;
  }
  
  .markdown-body code {
    color: #c0341d !important;
    background-color: #fbe5e1 !important;
    font-weight: bold;
  }
  
  pre>code.hljs {
    color: inherit !important;
    background-color: inherit !important;
    font-weight: inherit !important;
  }
</style>

PTUDW - Final Project - Online Academy
===

###### tags: `PTUDW-LT` `project`


:::info
**Yêu cầu**: xây dựng ứng dụng web **Online Academy** gồm các phân hệ & chức năng sau
:::

## 1. Phân hệ người dùng nặc danh - ==guest==

### 1.1 Hệ thống Menu
- Hiển thị danh sách lĩnh vực ==category==
- Có 2 cấp lĩnh vực
  - IT ➠ Lập trình Web
  - IT ➠ Lập trình thiết bị di động

### 1.2 Trang chủ
- Hiển thị 3-4 khoá học nổi bật nhất trong tuần qua
- Hiển thị 10 khoá học được xem nhiều nhất (ở mọi lĩnh vực)
- Hiển thị 10 khoá học mới nhất (ở mọi lĩnh vực)
- Hiển thị danh sách lĩnh vực được đăng ký học nhiều nhất trong tuần qua

###### Khuyến khích _hiệu ứng_ ở trang chủ
- slideshow
- carousel

### 1.3 Xem danh sách khoá học
- Theo lĩnh vực ==category==
- Có **phân trang** danh sách các khoá học

###### _Lưu ý_: Khoá học hiển thị trên trang chủ & trang danh sách gồm các thông tin sau
- Tiêu đề
- Lĩnh vực
- Giảng viên
- Đánh giá kèm số lượng học viên đánh giá
- Ảnh đại diện khoá học
- Giá đăng ký học kèm giá khuyến mại (nếu có)

### 1.4 Tìm kiếm khoá học

:::success
Sử dụng kỹ thuật `Full-text search`, cho phép user tìm với các từ khoá gần đúng.
:::

- Tìm theo ==tên khoá học== and/or tìm theo ==lĩnh vực==
- **Phân trang** kết quả
- Sắp xếp theo ý người dùng
  - Điểm đánh giá giảm dần
  - Giá tăng dần
- Những khoá học mới đăng hoặc các khoá học có nhiều học viên đăng ký học (Best Seller) sẽ có thể hiện khác với các khoá học còn lại

:::warning
Người dùng có thể click vào ==category== để chuyển nhanh sang màn hình ==XEM DANH SÁCH KHOÁ HỌC==
:::

:::info
Tham khảo https://www.udemy.com/courses/search/?src=ukw&q=python
:::

### 1.5 Xem chi tiết khoá học

- Nội dung đầy đủ của khoá học
  - Ảnh đại diện (size lớn)
  - Tên khoá học
  - Mô tả ngắn gọn nội dung khoá học
  - Mô tả chi tiết nội dung khoá học
  - Điểm đánh giá & số lượng học viên đánh giá & số lượng học viên đăng ký học
  - Học phí & thông tin khuyến mại (nếu có)
  - Lần cập nhật cuối
  - Đề cương khoá học, cho phép xem trước (preview) một số chương
- 5 khoá học khác cùng lĩnh vực được mua nhiều nhất
- Thông tin giảng viên
- Danh sách feedback của học viên về khoá học

:::info
Tham khảo thêm https://www.udemy.com/course/complete-python-bootcamp/
:::

### 1.6 Đăng ký

- Người dùng cần đăng ký tài khoản để có thể tham gia học cũng như thực hiện đánh giá, phản hồi chất lượng khoá học
  - Mật khẩu được mã hoá bằng thuật toán `bcrypt`
  - Thông tin
    - Họ tên
    - Email
      - Email không được trùng
      - Có ==xác nhận OTP==

## 2. Phân hệ học viên

### 2.1 Lưu khoá học vào danh sách yêu thích ==Watch List==
- Thực hiện tại view ==Chi tiết khoá học==

### 2.2 Quản lý hồ sơ cá nhân
- Thay đổi các thông tin: email, họ tên, mật khẩu (yêu cầu nhập mật khẩu cũ)
- Xem danh sách khoá học yêu thích của mình (watchlist)
- Loại bỏ các khoá học ra khỏi danh sách yêu thích
- Xem danh sách khoá học mà mình đã đăng ký học

### 2.3 Tham gia khoá học
- Học viên mua khoá học để có thể tham gia học
- Hình thức học là xem các video của khoá học được cung cấp bởi giảng viên
- Hệ thống lưu trữ trạng thái các bài giảng (video clip) mà học viên đã học giúp học viên dễ dàng theo dõi quá trình học của mình

### 2.4 Đánh giá & phản hồi các khoá học
- Chỉ đánh giá & phản hồi các khoá mà học viên có tham gia học

### 2.5 Xem nội dung bài giảng
- Xem các clip bài giảng của khoá học
- Sử dụng thư viện javascript media player
  + https://plyr.io
  + https://videojs.com

## 3. Giảng viên

### 3.1 Đăng khoá học

- Nhập đủ các thông tin của khoá học (xem phần ==Chi tiết khoá học==)
- Mô tả khoá học
  - Hỗ trợ `WYSIWYG`
    - TinyMCE (https://www.tiny.cloud)
    - ckeditor (https://ckeditor.com)
    - quilljs (https://quilljs.com)
- Bài giảng được đăng có thể chưa có đầy đủ các chương, khoá học sẽ có trạng thái là ==chưa hoàn thành==; khi giảng viên cập nhật nội dung các chương, khoá học sẽ có trạng thái ==đã hoàn thành==

### 3.2 Bổ sung thông tin & bài giảng cho khoá học
- Cập nhật thông tin mô tả khoá học & nội dung khoá học
- Upload video tương ứng với các chương còn thiếu
- Đánh dấu ==Hoàn Thành== khi đã cập nhật đầy đủ nội dung của khoá học

### 3.3 Quản lý hồ sơ cá nhân

- Cập nhật thông tin cá nhân, thông tin này được thể hiện ở view ==Chi tiết khoá học==, mục ==Thông tin giảng viên==
- Xem danh sách khoá học do mình giảng dạy & đăng tải

## 4. Phân hệ quản trị viên - ==administrator==

:::info
==Quản lý== bao gồm các thao tác sau:
1. Xem danh sách
1. Xem chi tiết
1. Thêm
1. Xoá
1. Cập nhật 
1. Và các thao tác chuyên biệt khác
:::

### 4.1 Quản lý lĩnh vực ==category==
- Các chức năng ==quản lý== cơ bản
- Không được xoá lĩnh vực đã có khoá học

### 4.2 Quản lý khoá học
- Gỡ bỏ khoá học

### 4.3 Quản lý danh sách học viên & giảng viên
- Các chức năng ==quản lý== cơ bản

:::warning
- Tài khoản học viên có được từ chức năng đăng ký tài khoản
- Tài khoản giảng viên do ban quản trị cấp riêng
:::

## 5. Các tính năng chung cho các phân hệ người dùng

### 5.1 Đăng nhập
- Tự cài đặt
- Hoặc sử dụng `passportjs` (http://www.passportjs.org)
- _Khuyến khích_ cài đặt thêm chức năng đăng nhập qua Google, Facebook, Twitter, Github, ...

### 5.2 Cập nhật thông tin cá nhân
- Họ tên
- Email liên lạc

### 5.3 Đổi mật khẩu
- Mật khẩu được mã hoá bằng thuật toán `bcrypt`

## 6. Các yêu cầu khác

### 6.1 Yêu cầu kỹ thuật
- Web App **MVC**
- Technical Stack
  - framework: `expressjs`
  - view engine: `handlebars/ejs`
  - db: `mysql/postgres/mongodb`
- Chỉ hoàn thành **ĐÚNG** các chức năng được yêu cầu
  - Có thể bổ sung các hiệu ứng để tăng tính tiện dụng của từng chức năng cụ thể

### 6.2 Yêu cầu dữ liệu
- Cần có ít nhất 10 khoá học thuộc 4-5 lĩnh vực, nội dung mô tả, hình ảnh & clips đầy đủ.
- Các khoá học phải có thông tin đánh giá & feedback đầy đủ

### 6.3 Yêu cầu quản lý mã nguồn
- Sinh viên cần upload mã nguồn lên ==github== từ lúc bắt đầu thực hiện đồ án.
- Nhóm nào lịch sử commit/push không nghiêm túc ➠ 0đ.