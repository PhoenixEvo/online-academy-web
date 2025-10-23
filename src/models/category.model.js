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
    }
};