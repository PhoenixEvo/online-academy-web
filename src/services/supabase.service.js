import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || process.env.SUPABASE_BUCKET_NAME;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Supabase is not fully configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env');
}
if (!SUPABASE_BUCKET) {
  console.warn('SUPABASE_BUCKET is not set. File uploads will fail until this is configured.');
}

const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '');

export function buildObjectPath(filename, folder) {
  const ext = (filename || '').split('.').pop();
  const safeExt = ext && ext.length < 12 ? ext.toLowerCase() : 'bin';
  const prefix = folder ? `${folder.replace(/\/+$/,'')}/` : '';
  const id = uuidv4();
  return `${prefix}${id}.${safeExt}`;
}

export async function uploadBuffer({ buffer, filename, contentType, folder }) {
  if (!SUPABASE_BUCKET) throw new Error('SUPABASE_BUCKET is not configured');
  const path = buildObjectPath(filename, folder);
  const { error } = await supabase
    .storage
    .from(SUPABASE_BUCKET)
    .upload(path, buffer, { contentType: contentType || 'application/octet-stream', upsert: false });
  if (error) throw error;
  const publicUrl = getPublicUrl(path);
  return { path, publicUrl };
}

export function getPublicUrl(path) {
  if (!SUPABASE_BUCKET) throw new Error('SUPABASE_BUCKET is not configured');
  const { data } = supabase
    .storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(path);
  return data.publicUrl;
}

// Extract the object path (key) from a Supabase public URL.
// Example: https://<proj>.supabase.co/storage/v1/object/public/<bucket>/folder/file.mp4
//  -> returns "folder/file.mp4"
export function extractPathFromPublicUrl(publicUrl) {
  try {
    const u = new URL(publicUrl);
    const parts = u.pathname.split('/').filter(Boolean);
    // expect: ['storage','v1','object','public', '<bucket>', ...path]
    const idx = parts.findIndex(p => p === 'public');
    if (idx !== -1 && parts[idx + 1]) {
      const bucket = parts[idx + 1];
      const rest = parts.slice(idx + 2).join('/');
      if (!rest) return null;
      // If SUPABASE_BUCKET is set and does not match, still return rest (caller may decide)
      return rest;
    }
  } catch {}
  return null;
}

export async function deleteObjectByPath(path) {
  if (!SUPABASE_BUCKET) {
    console.warn('SUPABASE_BUCKET is not configured; skip deleting object');
    return false;
  }
  const { data, error } = await supabase
    .storage
    .from(SUPABASE_BUCKET)
    .remove([path]);
  if (error) {
    console.warn('Supabase remove failed:', error);
    return false;
  }
  return true;
}

export async function deleteObjectByPublicUrl(publicUrl) {
  const p = extractPathFromPublicUrl(publicUrl);
  if (!p) return false;
  return deleteObjectByPath(p);
}
