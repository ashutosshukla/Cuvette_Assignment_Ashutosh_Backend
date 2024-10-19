import express from 'express';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/user.js'; // User model
import Job from '../models/jobs.js';

const router = express.Router();

// Helper function to generate OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
};

// Middleware to send OTP via email
const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};

// Signup Route
router.post('/signup', async (req, res) => {
    console.log("signup route is called");
  
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { name, phone, companyName, email } = req.body;
  
    try {
      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Generate OTP and send it to user's email
      const otp = generateOtp();
      await sendOtpEmail(email, otp); // Function to send OTP via email
  
      // Create a new user
      const newUser = new User({ 
        name, 
        phone, 
        companyName, 
        email, 
        otp // Store OTP temporarily; you might want to hash this or have a timeout
      });
  
      await newUser.save();
      res.status(201).json({ message: 'User registered, OTP sent to email' });
    } catch (error) {
      console.error('Error during signup:', error); // Log error for debugging
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

// Login Route
router.post('/login', [
  body('email').isEmail().withMessage('Enter a valid email'),
], async (req, res) => {
  console.log("login route is called");

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOtp(); // Generate OTP
    await sendOtpEmail(email, otp); // Send OTP to user's email

    user.otp = otp; // Store OTP in user document
    await user.save();

    res.status(200).json({ message: 'OTP sent to email' }); // Notify user to check email
  } catch (error) {
    console.error('Error during login:', error); // Log error for debugging
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify OTP Route
router.post('/verify-otp', [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('emailOtp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
], async (req, res) => {
  console.log("verify is called");

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, emailOtp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp === emailOtp) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

      // Clear OTP after verification
      user.otp = null; // Clear OTP to prevent reuse
      await user.save();

      res.status(200).json({ message: 'OTP verified successfully', token, user });
    } else {
      res.status(400).json({ message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('Error during OTP verification:', error); // Log error for debugging
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//job posting
router.post('/jobs', async (req, res) => {
    const { title, description, experienceLevel, email, date } = req.body;
  
    try {
      const newJob = new Job({
        title,
        description,
        experienceLevel,
        email,
        date,
      });
  
      await newJob.save();
      res.status(201).json({ message: 'Job posted successfully', job: newJob });
    } catch (error) {
      console.error('Error creating job:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });


export default router;
