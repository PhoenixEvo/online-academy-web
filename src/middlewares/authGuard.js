export function requireLogin(req, res, next) {
    if (req.isAuthenticated?.() && req.user) return next();
    return res.redirect('/auth/login');
  }
  
  export function requireRole(role) {
    return (req, res, next) => {
      if (req.isAuthenticated?.() && req.user?.role === role) return next();
      return res.status(403).render('error', { message: 'You do not have permission to access' });
    };
  }
  // 🆕 Chỉ thêm phần này — không sửa gì bên trên
export function requireAdmin(req, res, next) {
  // Kiểm tra đăng nhập
  if (!req.isAuthenticated?.() || !req.user) {
    req.flash?.('error', 'You must log in first!');
    return res.redirect('/auth/login');
  }

  // Kiểm tra quyền admin
  if (req.user.role !== 'admin') {
    req.flash?.('error', 'Access denied!');
    return res.redirect('/');
  }

  // Nếu hợp lệ thì cho qua
  next();
}