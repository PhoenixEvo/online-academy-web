import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { db } from '../models/db.js';

// Show profile page
export function showProfile(req, res) {
  try {
    // Ensure user data is properly formatted
    const userData = {
      id: req.user?.id,
      name: req.user?.name || '',
      email: req.user?.email || '',
      role: req.user?.role || 'student',
      created_at: req.user?.created_at || new Date()
    };

    res.render('profile', {
      layout: 'main',
      page: 'profile',
      title: 'Profile Settings',
      user: userData,
      values: userData, // pre-fill form with current user data
      csrfToken: req.csrfToken ? req.csrfToken() : ''
    });
  } catch (error) {
    console.error('Profile page error:', error);
    res.status(500).render('error', { 
      message: 'Error loading profile page',
      error: error.message 
    });
  }
}

// Validation rules for profile update
export const validateProfileUpdate = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2-50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email')
];

// Update profile information
export async function updateProfile(req, res, next) {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('profile', {
        layout: 'main',
        page: 'profile',
        title: 'Profile Settings',
        user: req.user,
        errors: errors.array(),
        values: req.body,
        csrfToken: req.csrfToken ? req.csrfToken() : ''
      });
    }

    const { name, email } = req.body;
    const userId = req.user.id;

    // Check if email is already taken by another user
    const existingUser = await db('users')
      .where({ email })
      .andWhere('id', '!=', userId)
      .first();

    if (existingUser) {
      return res.render('profile', {
        layout: 'main',
        page: 'profile',
        title: 'Profile Settings',
        user: req.user,
        error: 'Email already exists',
        values: req.body,
        csrfToken: req.csrfToken ? req.csrfToken() : ''
      });
    }

    // Update user profile
    await db('users')
      .where({ id: userId })
      .update({
        name,
        email,
        updated_at: new Date()
      });

    // Update session user data
    req.user.name = name;
    req.user.email = email;

    req.flash('success', 'Profile updated successfully!');
    res.redirect('/profile');
  } catch (e) {
    console.error('Profile update error:', e);
    next(e);
  }
}

// Validation rules for password change
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

// Change password
export async function changePassword(req, res, next) {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('profile', {
        layout: 'main',
        page: 'profile',
        title: 'Profile Settings',
        user: req.user,
        passwordErrors: errors.array(),
        values: req.body,
        csrfToken: req.csrfToken ? req.csrfToken() : ''
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current user with password hash
    const user = await db('users').where({ id: userId }).first();
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.render('profile', {
        layout: 'main',
        page: 'profile',
        title: 'Profile Settings',
        user: req.user,
        passwordError: 'Current password is incorrect',
        values: req.body,
        csrfToken: req.csrfToken ? req.csrfToken() : ''
      });
    }

    // Hash new password and update
    const password_hash = await bcrypt.hash(newPassword, 10);
    await db('users')
      .where({ id: userId })
      .update({
        password_hash,
        updated_at: new Date()
      });

    req.flash('success', 'Password changed successfully!');
    res.redirect('/profile');
  } catch (e) {
    console.error('Password change error:', e);
    next(e);
  }
}
