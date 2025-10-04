import { db } from "./db.js";

// find user by email
export async function findByEmail(email) {
  return db("users").where({ email }).first();
}
