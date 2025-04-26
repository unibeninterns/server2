import crypto from 'crypto';
import User from '../model/user.model.js';
import tokenService from '../services/token.service.js';
import { BadRequestError, UnauthorizedError } from '../utils/customErrors.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';
import generateSecurePassword from '../utils/passwordGenerator.js';

class submitController {
  // Complete profile from invitation
  submitProposal = asyncHandler(async (req, res) => {
    const { name, faculty, bio, title } = req.body;
    const profilePicture = req.file
      ? `${process.env.API_URL || 'http://localhost:3000'}/uploads/cover_pic/${req.file.filename}`
      : null;

    // Update user profile
    user.name = name;
    user.faculty = faculty;
    user.bio = bio;
    user.title = title;
    user.profilePicture = profilePicture;
    user.password = generatedPassword;
    user.isActive = true;
    user.invitationStatus = 'accepted';
    user.inviteToken = undefined;

    await user.save();
    logger.info(`Proposal submitted by user: ${user.email}`);

    res.status(200).json({
      success: true,
      message:
        'Proposal have been saved for review and profile completed successfully.',
    });
  });
}

export default new SubmitController();
