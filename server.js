// server.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js'; // Import your auth routes
import cors from 'cors'
import jobsRouter from './routes/job.js'

dotenv.config();

const app = express();
app.use(cors());
app.use(cors("http://localhost:5000/api/auth/verify-otp"))
app.use(cors("http://localhost:5000/api/auth/jobs"))

// Middleware
app.use(express.json()); // To handle JSON requests

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRouter);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Connection error:', error.message);
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
