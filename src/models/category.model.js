import db from '../models/db.js';
export default {
    findAll(){
        return db('categories');
    },
    findById(id){
        return db('categories').where('id',id).first();
    },
    add(category){
        return db('categories').insert(category);
    },
    async findAllTree() {
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
};