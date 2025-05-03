import User from '../model/user.model.js';
import Proposal from '../model/proposal.model.js';
import { BadRequestError, NotFoundError } from '../utils/customErrors.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';
import emailService from '../services/email.service.js';

class SubmitController {
  // Submit staff proposal
  submitStaffProposal = asyncHandler(async (req, res) => {
    const {
      fullName,
      academicTitle,
      department,
      faculty,
      email,
      alternativeEmail,
      phoneNumber,
      projectTitle,
      backgroundProblem,
      researchObjectives,
      methodologyOverview,
      expectedOutcomes,
      workPlan,
      estimatedBudget,
      coInvestigators,
    } = req.body;

    let parsedCoInvestigators = [];
    if (coInvestigators) {
      try {
        parsedCoInvestigators =
          typeof coInvestigators === 'string'
            ? JSON.parse(coInvestigators)
            : coInvestigators;
      } catch (error) {
        logger.error('Failed to parse coInvestigators:', error);
        // Default to empty array if parsing fails
        parsedCoInvestigators = [];
      }
    }

    // Check if user already exists or create new user
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name: fullName,
        email,
        alternativeEmail,
        userType: 'staff',
        department,
        faculty,
        academicTitle,
        phoneNumber,
      });

      await user.save();
      logger.info(`New staff user created with email: ${email}`);
    }

    // Create a new proposal
    const proposal = new Proposal({
      submitterType: 'staff',
      projectTitle,
      submitter: user._id,
      problemStatement: backgroundProblem,
      objectives: researchObjectives,
      methodology: methodologyOverview,
      expectedOutcomes,
      workPlan,
      estimatedBudget: Number(estimatedBudget),
      coInvestigators: parsedCoInvestigators,
    });

    // Handle CV file upload if present
    if (req.files && req.files.cvFile) {
      proposal.cvFile = `${
        process.env.API_URL || 'http://localhost:3000'
      }/uploads/documents/${req.files.cvFile[0].filename}`;
    }

    await proposal.save();

    // Add proposal to user's proposals
    user.proposals = user.proposals || [];
    user.proposals.push(proposal._id);
    await user.save();

    // Send notification email to reviewers
    try {
      const reviewerEmails =
        process.env.REVIEWER_EMAILS || 'reviewer@example.com';
      await emailService.sendProposalNotificationEmail(
        reviewerEmails,
        user.name,
        projectTitle,
        'staff'
      );

      await emailService.sendSubmissionConfirmationEmail(
        email,
        fullName,
        projectTitle,
        'staff'
      );
    } catch (error) {
      logger.error('Failed to send emails:', error);
      // Don't throw error to prevent proposal submission from failing
    }

    logger.info(`Staff proposal submitted by user: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Staff proposal submitted successfully and is under review.',
      data: { proposalId: proposal._id },
    });
  });

  // Submit master student proposal
  submitMasterStudentProposal = asyncHandler(async (req, res) => {
    const { fullName, email, alternativeEmail, phoneNumber } = req.body;

    // Check if user already exists or create new user
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name: fullName,
        email,
        alternativeEmail,
        userType: 'master_student',
        phoneNumber,
      });

      await user.save();
      logger.info(`New master student user created with email: ${email}`);
    }

    // Create a new proposal
    const proposal = new Proposal({
      submitterType: 'master_student',
      submitter: user._id,
    });

    // Handle budget file upload if present
    if (req.files && req.files.docFile) {
      proposal.docFile = `${
        process.env.API_URL || 'http://localhost:3000'
      }/uploads/documents/${req.files.docFile[0].filename}`;
    }

    await proposal.save();

    // Add proposal to user's proposals
    user.proposals = user.proposals || [];
    user.proposals.push(proposal._id);
    await user.save();

    // Send notification email to reviewers
    try {
      const reviewerEmails =
        process.env.REVIEWER_EMAILS || 'reviewer@example.com';
      await emailService.sendProposalNotificationEmail(
        reviewerEmails,
        user.name,
        'Master Student Proposal',
        'master_student'
      );

      // Send confirmation to submitter
      await emailService.sendSubmissionConfirmationEmail(
        email,
        fullName,
        'Master Student Proposal',
        'master_student'
      );
    } catch (error) {
      logger.error('Failed to send emails:', error);
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

  // Get user's proposals by email
  getUserProposalsByEmail = asyncHandler(async (req, res) => {
    const { email } = req.params;

    const user = await User.findOne({ email });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const proposals = await Proposal.find({ submitter: user._id }).sort({
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

    const proposal = await Proposal.findById(id)
      .populate('submitter', 'name email academicTitle')
      .populate({
        path: 'submitter',
        populate: [
          { path: 'faculty', select: 'title code' },
          { path: 'department', select: 'title code' },
        ],
      });

    if (!proposal) {
      throw new NotFoundError('Proposal not found');
    }

    res.status(200).json({
      success: true,
      data: proposal,
    });
  });
}

export default new SubmitController();
