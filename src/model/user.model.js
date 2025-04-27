// src/model/user.model.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^.+@.+\.uniben\.edu$/,
      'Please provide a valid UNIBEN email address',
    ],
  },
  alternativeEmail: {
    type: String,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address',
    ],
  },
  userType: {
    type: String,
    enum: ['staff', 'master_student'],
    required: [true, 'User type is required'],
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    trim: true,
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    trim: true,
  },
  academicTitle: {
    type: String,
    trim: true,
  },
  matricNumber: {
    type: String,
    trim: true,
  },
  programme: {
    type: String,
    trim: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
    required: [true, 'Phone number is required'],
  },
  proposals: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('User', UserSchema, 'Users_2');
