import mongoose from 'mongoose';

const ProposalSchema = new mongoose.Schema({
  submitterType: {
    type: String,
    enum: ['staff', 'master_student'],
    required: [true, 'Submitter type is required'],
  },

  // common
  projectTitle: {
    type: String,
    required: [
      function () {
        return this.submitterType === 'staff';
      },
      'Project title is required',
    ],
    trim: true,
  },
  submitter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Submitter is required'],
  },
  problemStatement: {
    type: String,
    required: [
      function () {
        return this.submitterType === 'staff';
      },
      'Problem statement is required',
    ],
  },
  objectives: {
    type: String,
    required: [
      function () {
        return this.submitterType === 'staff';
      },
      'Research objectives are required',
    ],
  },
  methodology: {
    type: String,
    required: [
      function () {
        return this.submitterType === 'staff';
      },
      'Methodology is required',
    ],
  },

  // ─── staff-only ───────────────────────────────────────────────────────────────
  expectedOutcomes: {
    type: String,
    required: [
      function () {
        return this.submitterType === 'staff';
      },
      'Expected outcomes are required for staff proposals',
    ],
  },
  workPlan: {
    type: String,
    required: [
      function () {
        return this.submitterType === 'staff';
      },
      'Work plan is required for staff proposals',
    ],
  },
  estimatedBudget: {
    type: Number,
    required: [
      function () {
        return this.submitterType === 'staff';
      },
      'Estimated budget is required for staff proposals',
    ],
  },
  coInvestigators: [
    {
      name: String,
      department: String,
      faculty: String,
      // you could even make each sub-field conditional if you like…
    },
  ],
  cvFile: {
    type: String,
    required: [
      function () {
        return this.submitterType === 'staff';
      },
      'CV file is required for staff proposals',
    ],
  },

  // ─── master_student-only ───────────────────────────────────────────────────────
  /*innovationImpact: {
    novelty: {
      type: String,
      required: [
        function() { return this.submitterType === 'master_student'; },
        'Novelty is required for master student proposals'
      ]
    },
    contribution: {
      type: String,
      required: [
        function() { return this.submitterType === 'master_student'; },
        'Contribution is required for master student proposals'
      ]
    }
  },
  interdisciplinaryRelevance: {
    type: String,
    required: [
      function() { return this.submitterType === 'master_student'; },
      'Interdisciplinary relevance is required for master student proposals'
    ]
  },
  implementationTimeline: {
    type: String,
    required: [
      function() { return this.submitterType === 'master_student'; },
      'Implementation timeline is required for master student proposals'
    ]
  }, */
  docFile: {
    type: String,
    required: [
      function () {
        return this.submitterType === 'master_student';
      },
      'Document file is required for master student proposals',
    ],
  },

  // status & timestamps
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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// keep updatedAt fresh
ProposalSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Proposal', ProposalSchema, 'Proposals');
