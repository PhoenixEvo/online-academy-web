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

// Alias for requireLogin - commonly used name
export const authGuard = requireLogin;
