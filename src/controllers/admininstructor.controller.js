// src/controllers/admininstructor.controller.js
import { userModel } from '../models/user.model.js';
import { instructorModel } from '../models/instructor.model.js';
import { db } from '../models/db.js';

// === LIST INSTRUCTORS ===
const list = async (req, res) => {
  try {
    const instructors = await instructorModel.findInstructors();
    res.render('admins/instructors/list', {
      layout: 'main',
      instructors,
      title: 'Instructor Management',
      success: req.flash('success'),
      error: req.flash('error'),
      csrfToken: req.csrfToken(),
      user: req.user,
      isAuthenticated: req.isAuthenticated(),
    });
  } catch (error) {
    console.error('[instructor.list] Error:', error);
    req.flash('error', 'Failed to load instructors');
    return res.redirect('/admins/instructors');
  }
};

// === RENDER ADD FORM ===
const renderAdd = async (req, res) => {
  res.render('admins/instructors/add', {
    layout: 'main',
    title: 'Add Instructor',
    csrfToken: req.csrfToken(),
    user: req.user,
    isAuthenticated: req.isAuthenticated(),
  });
};

// === ADD INSTRUCTOR (WITH TRANSACTION) ===
const add = async (req, res) => {
  const { name, email, password, job_title, avatar_url } = req.body;

  try {
    await db.transaction(async (trx) => {
    
      let user = await userModel.findByEmail(email, { transaction: trx });
    
      if (user) {
        const existingInstructor = await instructorModel.getInstructorByUserId(user.id, { transaction: trx });
        if (existingInstructor) {
          throw new Error('This user is already an instructor');
        }

        if (user.role !== 'instructor') {
          await userModel.updateUser(user.id, { role: 'instructor' }, { transaction: trx });
        }
      }
    
      else {
        if (!password?.trim()) {
          throw new Error('Password is required for new user');
        }

        user = await userModel.createUser(
          {
            name,
            email,
            password,
            role: 'instructor',
            avatar_url: avatar_url || null,
          },
          { transaction: trx }
        );
      }

      
      await instructorModel.createInstructor(
        {
          name: name || user.name,
          display_name: name || user.name,
          job_title: job_title || 'Instructor',
          image_50x50: avatar_url || user.avatar_url,
          image_100x100: avatar_url || user.avatar_url,
          user_id: user.id,
        },
        { transaction: trx }
      );
    });

    req.flash('success', 'Instructor added successfully');
    res.redirect('/admins/instructors');
  } catch (error) {
    console.error('[instructor.add] Error:', error);
    const msg =
      error.message.includes('duplicate key') || error.message.includes('already an instructor')
        ? 'Cannot create: This user is already linked to an instructor'
        : error.message || 'Failed to add instructor';

    req.flash('error', msg);
    res.redirect('/admins/instructors/add');
  }
};


const renderEdit = async (req, res) => {
  const { id } = req.params;
  try {
    const instructor = await instructorModel.getInstructorById(id);
    if (!instructor) {
      req.flash('error', 'Instructor not found');
      return res.redirect('/admins/instructors');
    }

    res.render('admins/instructors/edit', {
      layout: 'main',
      instructor,
      title: 'Edit Instructor',
      csrfToken: req.csrfToken(),
      user: req.user,
      isAuthenticated: req.isAuthenticated(),
    });
  } catch (error) {
    console.error('[instructor.renderEdit] Error:', error);
    req.flash('error', 'Error loading instructor');
    return res.redirect('/admins/instructors');
  }
};


const update = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, job_title, avatar_url, is_verified } = req.body;

  try {
    await db.transaction(async (trx) => {
      const instructor = await instructorModel.getInstructorById(id, { transaction: trx });
      if (!instructor) throw new Error('Instructor not found');

      
      const existingUser = await userModel.findByEmail(email, { transaction: trx });
      if (existingUser && existingUser.id !== instructor.user_id) {
        throw new Error('Email already in use by another user');
      }


      const updateUserData = {
        name,
        email,
        avatar_url: avatar_url || null,
        is_verified: !!is_verified,
      };
      if (password?.trim()) {
        const bcrypt = await import('bcryptjs');
        updateUserData.password = await bcrypt.hash(password, 10);
      }
      await userModel.updateUser(instructor.user_id, updateUserData, { transaction: trx });

      
      await instructorModel.updateInstructor(
        id,
        {
          name,
          display_name: name,
          job_title: job_title || 'Instructor',
          image_50x50: avatar_url,
          image_100x100: avatar_url,
        },
        { transaction: trx }
      );
    });

    req.flash('success', 'Instructor updated successfully');
    res.redirect('/admins/instructors');
  } catch (error) {
    console.error('[instructor.update] Error:', error);
    req.flash('error', error.message || 'Update failed');
    res.redirect(`/admins/instructors/${id}/edit`);
  }
};
//RENDER DELETE CONFIRM 
const renderDelete = async (req, res) => {
  const { id } = req.params;
  try {
    const instructor = await instructorModel.getInstructorById(id);
    if (!instructor) {
      req.flash('error', 'Instructor not found');
      return res.redirect('/admins/instructors');
    }

    res.render('admins/instructors/removeInstructor', {
      layout: 'main',
      instructor,
      title: 'Delete Instructor',
      csrfToken: req.csrfToken(),
      user: req.user,
      isAuthenticated: req.isAuthenticated(),
    });
  } catch (error) {
    console.error('[instructor.renderDelete] Error:', error);
    req.flash('error', 'Error loading instructor');
    return res.redirect('/admins/instructors');
  }
};

// DELETE INSTRUCTOR (WITH TRANSACTION)
const deleteInstructor = async (req, res) => {
  const { id } = req.params;

  try {
    await db.transaction(async (trx) => {
      const instructor = await instructorModel.getInstructorById(id, { transaction: trx });
      if (!instructor) throw new Error('Instructor not found');

      await instructorModel.deleteInstructor(id, { transaction: trx });
      await userModel.deleteUser(instructor.user_id, { transaction: trx });
    });

    req.flash('success', 'Instructor and user deleted successfully');
    res.redirect('/admins/instructors');
  } catch (error) {
    console.error('[instructor.delete] Error:', error);
    req.flash('error', error.message || 'Delete failed');
    res.redirect('/admins/instructors');
  }
};

//EXPORT CONTROLLER
export const adminInstructorController = {
  list,
  renderAdd,
  add,
  renderEdit,
  update,
  renderDelete,
  delete: deleteInstructor,
};