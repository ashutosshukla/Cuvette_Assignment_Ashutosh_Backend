// models/Job.js
import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true, // Remove whitespace from the beginning and end
  },
  description: {
    type: String,
    required: true,
  },
  experienceLevel: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior Level'], // Restrict values to these options
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true, // Store email in lowercase
  },
  date: {
    type: Date,
    required: true,
    default: Date.now, // Set default to current date
  },
}, {
  timestamps: true, // Automatically create createdAt and updatedAt fields
});

// Create the Job model
const Job = mongoose.model('Job', JobSchema);

export default Job;
