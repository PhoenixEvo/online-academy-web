import bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import { body, validationResult } from 'express-validator';
import { db } from '../models/db.js';
import { hashOtp } from '../services/otp.service.js';
import { sendOtpEmail, sendResetPasswordEmail } from '../services/mail.service.js';

export function showLogin(req,res){ res.render('auth/login', { layout: 'auth', page: 'login', title: 'Login' }); }
export function showRegister(req,res){ res.render('auth/register', { layout: 'auth', page: 'register', title: 'Register' }); }
export function showForgotPassword(req,res){ 
  const formData = req.session.forgotPasswordForm || {};
  delete req.session.forgotPasswordForm; // clear after use
  res.render('auth/forgot-password', { 
    layout: 'auth', 
    page: 'forgot-password', 
    title: 'Forgot Password',
    // values: formData
  }); 
}
export function showResetPassword(req,res){ 
  const formData = req.session.resetPasswordForm || {};
  delete req.session.resetPasswordForm; // clear after use
  res.render('auth/reset-password', { 
    layout: 'auth', 
    page: 'reset-password', 
    title: 'Reset Password',
    email: formData.email || '',
    // values: formData
  }); 
}

// validation rules for registration
export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2-50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .equals('student')
    .withMessage('Only student registration is allowed. Instructor accounts are created by administrators.')
];

// register a new user
export async function doRegister(req, res, next) {
  try {
    
    // check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/register', { 
        layout: 'auth',
        page: 'register',
        title: 'Register',
        errors: errors.array(),
        values: req.body 
      });
    }

    const { name, email, password, role } = req.body;
    
    // check if email already exists
    const existed = await db('users').where({ email }).first();
    if (existed) {
      return res.render('auth/register', { 
        layout: 'auth',
        page: 'register',
        title: 'Register',
        error: 'Email already exists',
        values: req.body 
      });
    }

    // create user
    const password_hash = await bcrypt.hash(password, 10);
    const [user] = await db('users')
      .insert({ name, email, password_hash, role })
      .returning('*');

    // generate and store OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await db('otp_tokens').insert({
      user_id: user.id,
      email: email,
      otp_hash: await hashOtp(otp),
      expires_at: dayjs().add(10, 'minute').toDate()
    });

    // send OTP email
    await sendOtpEmail(email, otp);

    res.render('auth/verify-otp', { 
      layout: 'auth',
      page: 'verify-otp',
      title: 'Verify OTP',
      email,
      success: 'OTP code has been sent to your email'
    });
  } catch (e) { 
    console.error('Registration error:', e);
    next(e); 
  }
}

// validation rules for OTP verification
export const validateOtp = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email'),
  body('code')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP code must be 6 digits')
];

// validation rules for forgot password
export const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email')
];

// validation rules for reset password
export const validateResetPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email'),
  body('code')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP code must be 6 digits'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

// resend OTP
export async function resendOtp(req, res, next) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // find user by email
    const user = await db('users').where({ email }).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // update existing OTP or insert new one
    await db('otp_tokens')
      .where({ email, consumed: false })
      .del();
    
    await db('otp_tokens').insert({
      user_id: user.id,
      email: email,
      otp_hash: await hashOtp(otp),
      expires_at: dayjs().add(10, 'minute').toDate()
    });

    // send new OTP email
    await sendOtpEmail(email, otp);

    res.json({ success: 'New OTP code has been sent to your email' });
  } catch (e) {
    console.error('Resend OTP error:', e);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
}

// verify OTP
export async function verifyOtp(req, res, next) {
  try {
    // check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/verify-otp', { 
        layout: 'auth',
        page: 'verify-otp',
        title: 'Verify OTP',
        email: req.body.email,
        errors: errors.array()
      });
    }

    const { email, code } = req.body;
    
    // find valid OTP token
    const token = await db('otp_tokens')
      .where({ email, consumed: false })
      .andWhere('expires_at', '>', new Date())
      .orderBy('created_at', 'desc')
      .first();

    if (!token) {
      return res.render('auth/verify-otp', { 
        layout: 'auth',
        page: 'verify-otp',
        title: 'Verify OTP',
        email,
        error: 'Invalid or expired OTP code'
      });
    }

    // verify OTP
    const isValidOtp = await bcrypt.compare(code, token.otp_hash);
    if (!isValidOtp) {
      return res.render('auth/verify-otp', { 
        layout: 'auth',
        page: 'verify-otp',
        title: 'Verify OTP',
        email,
        error: 'Incorrect OTP code'
      });
    }

    // Mark OTP as consumed
    await db('otp_tokens').where({ id: token.id }).update({ consumed: true });
    
    // Mark user as verified (if you have is_verified column)
    await db('users').where({ id: token.user_id }).update({ is_verified: true });

    // Set flash message and redirect
    console.log('Setting flash success message and redirecting...');
    req.flash('success', 'Verification successful! You can now log in.');
    console.log('Flash message set, redirecting to /auth/login');
    res.redirect('/auth/login');
  } catch (e) { 
    console.error('OTP verification error:', e);
    next(e); 
  }
}

// send reset password OTP
export async function sendResetOtp(req, res, next) {
  try {
    // check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', 'Please enter a valid email address');
      req.session.forgotPasswordForm = req.body;
      return res.redirect('/auth/forgot-password');
    }

    const { email } = req.body;
    
    // find user by email
    const user = await db('users').where({ email }).first();
    if (!user) {
      req.flash('error', 'Email not found in our system');
      req.session.forgotPasswordForm = { email };
      return res.redirect('/auth/forgot-password');
    }

    // generate and store OTP for password reset
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // delete any existing reset OTPs for this email
    await db('otp_tokens')
      .where({ email, consumed: false })
      .del();
    
    await db('otp_tokens').insert({
      user_id: user.id,
      email: email,
      otp_hash: await hashOtp(otp),
      expires_at: dayjs().add(10, 'minute').toDate()
    });

    // send reset password OTP email
    await sendResetPasswordEmail(email, otp);

    res.render('auth/reset-password', { 
      layout: 'auth',
      page: 'reset-password',
      title: 'Reset Password',
      email,
      success: 'Reset OTP code has been sent to your email'
    });
  } catch (e) {
    console.error('Send reset OTP error:', e);
    next(e);
  }
}

// reset password
export async function doResetPassword(req, res, next) {
  try {
    // check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      req.flash('error', errorMessages.join(', '));
      req.session.resetPasswordForm = req.body;
      return res.redirect('/auth/reset-password');
    }

    const { email, code, password } = req.body;
    
    // find valid OTP token
    const token = await db('otp_tokens')
      .where({ email, consumed: false })
      .andWhere('expires_at', '>', new Date())
      .orderBy('created_at', 'desc')
      .first();

    if (!token) {
      req.flash('error', 'Invalid or expired OTP code');
      req.session.resetPasswordForm = req.body;
      return res.redirect('/auth/reset-password');
    }

    // verify OTP
    const isValidOtp = await bcrypt.compare(code, token.otp_hash);
    if (!isValidOtp) {
      req.flash('error', 'Incorrect OTP code');
      req.session.resetPasswordForm = req.body;
      return res.redirect('/auth/reset-password');
    }

    // Mark OTP as consumed
    await db('otp_tokens').where({ id: token.id }).update({ consumed: true });
    
    // Update user password
    const password_hash = await bcrypt.hash(password, 10);
    await db('users').where({ id: token.user_id }).update({ password_hash });

    // Set flash message and redirect
    req.flash('success', 'Password reset successful! You can now log in with your new password.');
    res.redirect('/auth/login');
  } catch (e) { 
    console.error('Reset password error:', e);
    next(e); 
  }
}

export function restrict(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'You must be logged in to access that page');
  res.redirect('/auth/login');
}
export function restrictInstructor(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'instructor') {
    return next();
  }
  req.flash('error', 'You must be logged in as an instructor to access that page');
  res.redirect('/auth/login');
}
