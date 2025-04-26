import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'researcher', 'master_student', 'faculty'],
    default: 'researcher',
  },
  faculty: {
    type: String,
    trim: true,
  },
  department: {
    type: String,
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
  },
  bio: {
    type: String,
    trim: true,
  },
  title: {
    type: String,
    trim: true,
  },
  profilePicture: {
    type: String,
  },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  articles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
    },
  ],
  proposals: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal',
    },
  ],
});

export default mongoose.model('User', UserSchema, 'Users2');
