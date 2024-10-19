// routes/user.js
import express from 'express';
import authenticateToken from '../middleware/auth.js';
import User from '../models/user.js';

const router = express.Router();

// Example of a protected route
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
