// /**
//  * @param { import("knex").Knex } knex
//  * @returns { Promise<void> } 
//  */
// exports.seed = async function(knex) {
//   // Deletes ALL existing entries
//   await knex('table_name').del()
//   await knex('table_name').insert([
//     {id: 1, colName: 'rowValue1'},
//     {id: 2, colName: 'rowValue2'},
//     {id: 3, colName: 'rowValue3'}
//   ]);
// };
import bcrypt from 'bcrypt';

export async function seed(knex) {
  await knex('reviews').del();
  await knex('watchlist').del();
  await knex('enrollments').del();
  await knex('courses').del();
  await knex('categories').del();
  await knex('users').del();
  await knex('instructors').del();//new by xuanthanh

  const [adminId] = await knex('users').insert({
    name: 'Admin',
    email: 'admin@oa.local',
    password_hash: await bcrypt.hash('Admin@123', 10),
    role: 'admin'
  }).returning('id');

  const [instructorId] = await knex('users').insert({
    name: 'Jane Instructor',
    email: 'jane@oa.local',
    password_hash: await bcrypt.hash('Jane@123', 10),
    role: 'instructor'
  }).returning('id');

  const [studentId] = await knex('users').insert({
    name: 'John Student',
    email: 'john@oa.local',
    password_hash: await bcrypt.hash('John@123', 10),
    role: 'student'
  }).returning('id');

  const [instructorProfileId] = await knex('instructors').insert({//new by xuanthanh
    name: 'Jane Instructor',
    display_name: 'Dr. Jane Smith', 
    job_title: 'Senior Full Stack Developer',
    user_id: instructorId.id ?? instructorId,
    image_50x50: 'https://placehold.co/50x50',
    image_100x100: 'https://placehold.co/100x100',
    initials: 'JS',
    url: 'https://jane-instructor.com'
  }).returning('id');
  
  const [itId] = await knex('categories').insert({ name: 'IT' }).returning('id');
  const [webId] = await knex('categories').insert({ name: 'Lập trình Web', parent_id: itId.id ?? itId }).returning('id');
  
  const courseRows = [];
  for (let i = 1; i <= 10; i++) {
    courseRows.push({
      title: `Web Course #${i}`,
      short_desc: 'Short description',
      full_desc: 'Full description',
      price: 199000,
      sale_price: 99000,
      category_id: webId.id ?? webId,
      instructor_id: instructorId.id ?? instructorId,
      status: 'published',
      thumbnail_url: 'https://placehold.co/600x400'
    });
  }
  await knex('courses').insert(courseRows);

  // enroll student into first course
  await knex('enrollments').insert({ user_id: studentId.id ?? studentId, course_id: 1, active: true });
}
