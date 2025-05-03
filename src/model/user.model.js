// src/model/user.model.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
      /^.+@(.+\.)*uniben\.edu$/,
      'Please provide a valid UNIBEN email address',
    ],
  },
  alternativeEmail: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address',
    ],
  },
  password: {
    type: String,
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'researcher'],
    default: 'researcher',
    required: true,
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
  refreshToken: {
    type: String,
    select: false,
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

UserSchema.pre('save', async function (next) {
  if (this.password && this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', UserSchema, 'Users_2');
