// Change if needed to fit the project
import { db } from "../models/db.js";

// home page
export async function home(req, res, next) {
  try {
    // example: 10 hot courses by views
    const mostViewed = await db("courses").orderBy("views", "desc").limit(10);
    // 10 new courses
    const newest = await db("courses").orderBy("created_at", "desc").limit(10);
    
    res.render("home", { 
      mostViewed, 
      newest, 
      title: "Online Academy"
    });
  } catch (e) {
    next(e);
  }
}

// about page
export async function about(req, res, next) {
  res.render("about", { title: "About" });
}

// newsletter subscription
export async function subscribeNewsletter(req, res, next) {
  try {
    const { email } = req.body;
    
    // Basic email validation
    if (!email || !email.includes('@')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address.' 
      });
    }
    
    // Here you can add database logic to store the email
    // For now, we'll just log it and return success
    console.log('Newsletter subscription:', email);
    
    // You can add email to database here if you have a newsletter table
    // await db('newsletter').insert({ email, subscribed_at: new Date() });
    
    res.json({ 
      success: true, 
      message: 'Thank you for subscribing to our newsletter!' 
    });
  } catch (e) {
    console.error('Newsletter subscription error:', e);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred, please try again!' 
    });
  }
}