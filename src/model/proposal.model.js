import mongoose from 'mongoose';

const ProposalSchema = new mongoose.Schema({
  submitterType: {
    type: String,
    enum: ['faculty', 'master_student'],
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
  // Fields for both faculty and master students
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
  expectedOutcomes: {
    type: String,
    required: [true, 'Expected outcomes are required'],
  },
  workPlan: {
    type: String,
    required: [true, 'Work plan is required'],
  },
  estimatedBudget: {
    type: Number,
    required: [true, 'Estimated budget is required'],
  },

  // Faculty specific fields
  coInvestigators: [
    {
      name: String,
      department: String,
      faculty: String,
    },
  ],

  // Master student specific fields
  innovationImpact: {
    novelty: String,
    contribution: String,
  },
  interdisciplinaryRelevance: String,
  implementationTimeline: String,

  // Common fields
  cvFile: {
    type: String,
  },
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
  reviewers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  reviewComments: [
    {
      reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      comment: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
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
