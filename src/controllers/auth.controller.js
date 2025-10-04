import bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import { body, validationResult } from 'express-validator';
import { db } from '../models/db.js';
import { hashOtp } from '../services/otp.service.js';
import { sendOtpEmail } from '../services/mail.service.js';

export function showLogin(req,res){ res.render('auth/login', { layout: 'auth', page: 'login', title: 'Login' }); }
export function showRegister(req,res){ res.render('auth/register', { layout: 'auth', page: 'register', title: 'Register' }); }

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
    .isIn(['student', 'instructor'])
    .withMessage('Role must be either student or instructor')
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
      req.flash('error', 'Invalid or expired OTP code');
      return res.render('auth/verify-otp', { 
        layout: 'auth',
        page: 'verify-otp',
        title: 'Verify OTP',
        email
      });
    }

    // verify OTP
    const isValidOtp = await bcrypt.compare(code, token.otp_hash);
    if (!isValidOtp) {
      req.flash('error', 'Incorrect OTP code');
      return res.render('auth/verify-otp', { 
        layout: 'auth',
        page: 'verify-otp',
        title: 'Verify OTP',
        email
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
