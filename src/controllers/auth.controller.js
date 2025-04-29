import User from '../model/user.model.js';
import tokenService from '../services/token.service.js';
import { UnauthorizedError } from '../utils/customErrors.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

class AuthController {
  adminLogin = asyncHandler(async (req, res) => {
    logger.info('Request body:', req.body);
    const { email, password } = req.body;

    logger.info(`Admin login attempt for email: ${email}`);

    // Find user and check password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      logger.warn(`No admin account found for email: ${email}`);
      throw new UnauthorizedError('No account found with this email address');
    }

    if (user.role !== 'admin') {
      logger.warn(`Non-admin user attempted admin login: ${email}`);
      throw new UnauthorizedError('Access denied: Admin privileges required');
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      logger.warn(`Incorrect password attempt for admin: ${email}`);
      throw new UnauthorizedError('Incorrect password');
    }

    const tokens = tokenService.generateTokens({
      userId: String(user._id),
      email: user.email,
      role: user.role,
    });

    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    tokenService.setRefreshTokenCookie(res, tokens.refreshToken);
    logger.info(`Admin login successful for: ${email}`);

    res.json({
      success: true,
      accessToken: tokens.accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });
}

export default new AuthController();
