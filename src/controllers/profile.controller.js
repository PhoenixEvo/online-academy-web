import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { db } from '../models/db.js';

export async function showProfile(req, res, next) {
  try {
    const userData = {
      id: req.user?.id,
      name: req.user?.name || '',
      email: req.user?.email || '',
      role: req.user?.role || 'student',
      created_at: req.user?.created_at || new Date()
    };

    const model = {
      layout: 'main',
      page: 'profile',
      title: 'Profile Settings',
      user: userData,
      values: userData,
      activeTab: req.query.tab || (userData.role === 'instructor' ? 'account' : 'account'),
      csrfToken: req.csrfToken ? req.csrfToken() : ''
    };

    if (userData.role === 'instructor') {
      // Load instructor info for unified profile view
      const InstructorModel = (await import('../models/instructor.model.js')).default;
      const information = await InstructorModel.findByUserId(userData.id);
      model.instructor = information || { user_id: userData.id };
    }

    res.render('profile', model);
  } catch (error) {
    console.error('Profile page error:', error);
    next(error);
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
// Show instructor profile
import InstructorModel from '../models/instructor.model.js';
export async function showInstructorProfile(req, res, next) {
  try {
    const rawId = req.params.id || req.user?.id;
    const userIdNum = Number(rawId);
    if (!rawId || Number.isNaN(userIdNum)) {
      req.flash?.('error', 'Missing user');
      if (req.user?.id) return res.redirect(`/profile?tab=${encodeURIComponent(req.query.tab||'account')}`);
      return res.redirect('/auth/login');
    }
    const activeTab = req.query.tab || 'account';
    // Unified: redirect to single profile page with tab
    return res.redirect(`/profile?tab=${encodeURIComponent(activeTab)}`);
  } catch (err) {
    next(err);
  }
}

//update instructor profile
export async function updateInstructorProfile(req, res, next) {
  const instructorId = req.params.id;
  res.render('instructor-profile', {
    layout: 'main',
    page: 'instructor-profile',
    title: 'Instructor Profile',
    instructor: {}, //updated instructor data
    csrfToken: req.csrfToken ? req.csrfToken() : ''
  });

}
// update the instructor profile picture
export async function updateInstructorProfilePicture(req, res, next) {
  try {
    const userId = req.params.id;
    const { avatar_url } = req.body;
    if (!avatar_url) {
      req.flash?.('error', 'Missing avatar URL');
      return res.redirect(`/profile?tab=photo`);
    }
    //update instructors.image_100x100 and users.avatar_url
    await db('instructors').where({ user_id: userId }).update({ image_100x100: avatar_url, updated_at: new Date() });
    await db('users').where({ id: userId }).update({ avatar_url, updated_at: new Date() });
    req.flash?.('success', 'Profile image updated');
    res.redirect(`/profile?tab=photo`);
  } catch (err) {
    next(err);
  }
}
