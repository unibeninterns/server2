import User from '../model/user.model.js';
import Proposal from '../model/proposal.model.js';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/customErrors.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';
import emailService from '../services/email.service.js';

class AdminController {
  // Update proposal status
  updateProposalStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, comment } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      throw new UnauthorizedError(
        'You do not have permission to perform this action'
      );
    }

    // Valid status values
    const validStatuses = [
      'under_review',
      'approved',
      'rejected',
      'revision_requested',
    ];
    if (!validStatuses.includes(status)) {
      throw new BadRequestError('Invalid status value');
    }

    const proposal = await Proposal.findById(id).populate('submitter');

    if (!proposal) {
      throw new NotFoundError('Proposal not found');
    }

    // Update proposal status
    proposal.status = status;

    // Add review comment if provided
    if (comment) {
      proposal.reviewComments.push({
        reviewer: req.user.id,
        comment,
        date: Date.now(),
      });
    }

    await proposal.save();

    // Send email notification to the submitter
    try {
      await emailService.sendProposalStatusUpdateEmail(
        proposal.submitter.email,
        proposal.submitter.name,
        proposal.projectTitle,
        status
      );
    } catch (error) {
      logger.error('Failed to send status update email:', error);
    }

    logger.info(
      `Proposal ${id} status updated to ${status} by admin ${req.user.id}`
    );

    res.status(200).json({
      success: true,
      message: `Proposal status updated to ${status}`,
      data: { proposalId: proposal._id, status: proposal.status },
    });
  });

  // Assign reviewers to proposal
  assignReviewers = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reviewerIds } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      throw new UnauthorizedError(
        'You do not have permission to perform this action'
      );
    }

    if (!Array.isArray(reviewerIds) || reviewerIds.length === 0) {
      throw new BadRequestError(
        'Reviewer IDs must be provided as a non-empty array'
      );
    }

    const proposal = await Proposal.findById(id);

    if (!proposal) {
      throw new NotFoundError('Proposal not found');
    }

    // Verify all reviewers exist
    const reviewers = await User.find({ _id: { $in: reviewerIds } });

    if (reviewers.length !== reviewerIds.length) {
      throw new BadRequestError('One or more reviewer IDs are invalid');
    }

    // Update proposal reviewers
    proposal.reviewers = reviewerIds;
    proposal.status = 'under_review';

    await proposal.save();

    logger.info(`Reviewers assigned to proposal ${id} by admin ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Reviewers assigned successfully',
      data: { proposalId: proposal._id, reviewers: proposal.reviewers },
    });
  });

  // Get proposal statistics
  getProposalStatistics = asyncHandler(async (req, res) => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      throw new UnauthorizedError(
        'You do not have permission to access this resource'
      );
    }

    const totalProposals = await Proposal.countDocuments();
    const facultyProposals = await Proposal.countDocuments({
      submitterType: 'faculty',
    });
    const studentProposals = await Proposal.countDocuments({
      submitterType: 'master_student',
    });

    const statusCounts = await Proposal.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusStats = {};
    statusCounts.forEach((item) => {
      statusStats[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalProposals,
        byType: {
          faculty: facultyProposals,
          student: studentProposals,
        },
        byStatus: statusStats,
      },
    });
  });
}

export default new AdminController();
