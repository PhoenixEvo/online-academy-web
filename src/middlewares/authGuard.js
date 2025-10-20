export function requireLogin(req, res, next) {
    if (req.isAuthenticated?.() && req.user) {
        return next();
    }
    // Lưu URL hiện tại vào session để redirect sau khi login
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'please log in to continue');
    return res.redirect('/auth/login');
}
export function requireRole(role) {
    return (req, res, next) => {
        if (!req.isAuthenticated?.() || !req.user) {
            req.session.returnTo = req.originalUrl;
            req.flash('error', 'please log in to continue');
            return res.redirect('/auth/login');
        }
        
        if (req.user.role === role) {
            return next();
        }
        
        return res.status(403).render('error');
    };
}