import User from '../model/user.model.js';
import Proposal from '../model/proposal.model.js';
import { BadRequestError, NotFoundError } from '../utils/customErrors.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';
import emailService from '../services/email.service.js';

class SubmitController {
  // Submit faculty proposal
  submitFacultyProposal = asyncHandler(async (req, res) => {
    const {
      projectTitle,
      backgroundProblem,
      researchObjectives,
      methodologyOverview,
      expectedOutcomes,
      workPlan,
      estimatedBudget,
      coInvestigators,
    } = req.body;

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Create a new proposal
    const proposal = new Proposal({
      submitterType: 'faculty',
      projectTitle,
      submitter: userId,
      problemStatement: backgroundProblem,
      objectives: researchObjectives,
      methodology: methodologyOverview,
      expectedOutcomes,
      workPlan,
      estimatedBudget: parseFloat(estimatedBudget),
      coInvestigators: coInvestigators || [],
    });

    // Handle CV file upload if present
    if (req.files && req.files.cvFile) {
      proposal.cvFile = `${process.env.API_URL || 'http://localhost:3000'}/uploads/documents/${req.files.cvFile[0].filename}`;
    }

    await proposal.save();

    // Add proposal to user's proposals
    user.proposals = user.proposals || [];
    user.proposals.push(proposal._id);
    await user.save();

    // Send notification email to reviewers
    try {
      await emailService.sendProposalNotificationEmail(
        process.env.REVIEWER_EMAIL || 'reviewer@example.com',
        user.name,
        projectTitle,
        'faculty'
      );
    } catch (error) {
      logger.error('Failed to send notification email:', error);
      // Don't throw error to prevent proposal submission from failing
    }

    logger.info(`Faculty proposal submitted by user: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Faculty proposal submitted successfully and is under review.',
      data: { proposalId: proposal._id },
    });
  });

  // Submit master student proposal
  submitMasterStudentProposal = asyncHandler(async (req, res) => {
    const {
      projectTitle,
      problemStatement,
      objectivesOutcomes,
      researchApproach,
      innovationNovelty,
      innovationContribution,
      interdisciplinaryRelevance,
      implementationPlan,
      estimatedBudget,
    } = req.body;

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Create a new proposal
    const proposal = new Proposal({
      submitterType: 'master_student',
      projectTitle,
      submitter: userId,
      problemStatement,
      objectives: objectivesOutcomes,
      methodology: researchApproach,
      innovationImpact: {
        novelty: innovationNovelty,
        contribution: innovationContribution,
      },
      interdisciplinaryRelevance,
      implementationTimeline: implementationPlan,
      estimatedBudget: parseFloat(estimatedBudget),
    });

    // Handle budget file upload if present
    if (req.files && req.files.budgetFile) {
      proposal.budgetFile = `${process.env.API_URL || 'http://localhost:3000'}/uploads/documents/${req.files.budgetFile[0].filename}`;
    }

    await proposal.save();

    // Add proposal to user's proposals
    user.proposals = user.proposals || [];
    user.proposals.push(proposal._id);
    await user.save();

    // Send notification email to reviewers
    try {
      await emailService.sendProposalNotificationEmail(
        process.env.REVIEWER_EMAIL || 'reviewer@example.com',
        user.name,
        projectTitle,
        'master_student'
      );
    } catch (error) {
      logger.error('Failed to send notification email:', error);
      // Don't throw error to prevent proposal submission from failing
    }

    logger.info(`Master student proposal submitted by user: ${user.email}`);

    res.status(201).json({
      success: true,
      message:
        'Master student proposal submitted successfully and is under review.',
      data: { proposalId: proposal._id },
    });
  });

  // Get all proposals for admin
  getAllProposals = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
      throw new BadRequestError(
        'You do not have permission to access this resource'
      );
    }

    const proposals = await Proposal.find()
      .populate('submitter', 'name email faculty department academicTitle')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: proposals.length,
      data: proposals,
    });
  });

  // Get user's proposals
  getUserProposals = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const proposals = await Proposal.find({ submitter: userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: proposals.length,
      data: proposals,
    });
  });

  // Get proposal by ID
  getProposalById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const proposal = await Proposal.findById(id).populate(
      'submitter',
      'name email faculty department academicTitle'
    );

    if (!proposal) {
      throw new NotFoundError('Proposal not found');
    }

    // Check if user is admin or the proposal submitter
    if (
      req.user.role !== 'admin' &&
      proposal.submitter._id.toString() !== userId
    ) {
      throw new BadRequestError(
        'You do not have permission to access this proposal'
      );
    }

    res.status(200).json({
      success: true,
      data: proposal,
    });
  });
}

export default new SubmitController();
