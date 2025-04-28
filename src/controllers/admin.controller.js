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
  // Get all proposals with pagination and filtering
  getAllProposals = asyncHandler(async (req, res) => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      throw new UnauthorizedError('You do not have permission to access this resource');
    }

    const { page = 1, limit = 10, status, submitterType, sort = 'createdAt', order = 'desc' } = req.query;
    
    const query = {};
    
    // Apply filters if provided
    if (status) query.status = status;
    if (submitterType) query.submitterType = submitterType;
    
    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'asc' ? 1 : -1;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: sortObj,
      populate: [
        { path: 'submitter', select: 'name email userType phoneNumber alternativeEmail' }
      ]
    };
    
    const proposals = await Proposal.find(query)
      .sort(sortObj)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .populate('submitter', 'name email userType phoneNumber alternativeEmail');
    
    const totalProposals = await Proposal.countDocuments(query);

    logger.info(`Admin ${req.user.id} retrieved proposals list`);

    res.status(200).json({
      success: true,
      count: proposals.length,
      totalPages: Math.ceil(totalProposals / options.limit),
      currentPage: options.page,
      data: proposals,
    });
  });

  // Get proposal by ID
  getProposalById = asyncHandler(async (req, res) => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      throw new UnauthorizedError('You do not have permission to access this resource');
    }

    const { id } = req.params;

    const proposal = await Proposal.findById(id)
      .populate('submitter', 'name email userType phoneNumber alternativeEmail faculty department academicTitle');

    if (!proposal) {
      throw new NotFoundError('Proposal not found');
    }

    logger.info(`Admin ${req.user.id} retrieved proposal ${id}`);

    res.status(200).json({
      success: true,
      data: proposal,
    });
  });

  // Update proposal status
  updateProposalStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, comment } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      throw new UnauthorizedError('You do not have permission to perform this action');
    }

    // Valid status values
    const validStatuses = [
      'submitted',
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

    await proposal.save();

    // Send email notification to the submitter if email service is available
    try {
      if (proposal.submitter && proposal.submitter.email) {
        await emailService.sendProposalStatusUpdateEmail(
          proposal.submitter.email,
          proposal.submitter.name || 'Researcher',
          proposal.projectTitle || 'Your proposal',
          status
        );
      }
    } catch (error) {
      logger.error('Failed to send status update email:', error);
    }

    logger.info(`Proposal ${id} status updated to ${status} by admin ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: `Proposal status updated to ${status}`,
      data: { proposalId: proposal._id, status: proposal.status },
    });
  });

  // Get proposal statistics
  getProposalStatistics = asyncHandler(async (req, res) => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      throw new UnauthorizedError('You do not have permission to access this resource');
    }

    const totalProposals = await Proposal.countDocuments();
    const staffProposals = await Proposal.countDocuments({ submitterType: 'staff' });
    const studentProposals = await Proposal.countDocuments({ submitterType: 'master_student' });

    const statusCounts = await Proposal.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusStats = {};
    statusCounts.forEach((item) => {
      statusStats[item._id] = item.count;
    });

    logger.info(`Admin ${req.user.id} retrieved proposal statistics`);

    res.status(200).json({
      success: true,
      data: {
        total: totalProposals,
        byType: {
          staff: staffProposals,
          master_student: studentProposals,
        },
        byStatus: statusStats,
      },
    });
  });
}

export default new AdminController();