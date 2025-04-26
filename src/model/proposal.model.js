// src/model/proposal.model.js
import mongoose from 'mongoose';

const ProposalSchema = new mongoose.Schema({
  submitterType: {
    type: String,
    enum: ['staff', 'master_student'],
    required: [true, 'Submitter type is required'],
  },
  projectTitle: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
  },
  submitter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Submitter is required'],
  },

  // Common fields
  problemStatement: {
    type: String,
    required: [true, 'Problem statement is required'],
  },
  objectives: {
    type: String,
    required: [true, 'Research objectives are required'],
  },
  methodology: {
    type: String,
    required: [true, 'Methodology is required'],
  },

  // Staff specific fields
  expectedOutcomes: {
    type: String,
  },
  workPlan: {
    type: String,
  },
  estimatedBudget: {
    type: Number,
    required: [true, 'Estimated budget is required'],
  },
  coInvestigators: [
    {
      name: String,
      department: String,
      faculty: String,
    },
  ],
  cvFile: {
    type: String,
  },

  // Master student specific fields
  innovationImpact: {
    novelty: String,
    contribution: String,
  },
  interdisciplinaryRelevance: String,
  implementationTimeline: String,
  budgetFile: {
    type: String,
  },

  status: {
    type: String,
    enum: [
      'submitted',
      'under_review',
      'approved',
      'rejected',
      'revision_requested',
    ],
    default: 'submitted',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on save
ProposalSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Proposal', ProposalSchema, 'Proposals');
