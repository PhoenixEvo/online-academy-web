import db from './db.js';

export function findAll(){
  return db('categories');
}
export function findById(id){
  return db('categories').where('id',id).first();
}
export function add(category){
  return db('categories').insert(category);
}
export async function findAllTree() {
  const categories = await db('categories');
  const map = {};
  categories.forEach(c => map[c.id] = { ...c, children: [] });

  const roots = [];
  categories.forEach(c => {
    if (!c.parent_id) roots.push(map[c.id]);
    else map[c.parent_id]?.children.push(map[c.id]);
  });

  return roots;
}
