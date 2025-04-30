import User from '../model/user.model.js';
import tokenService from '../services/token.service.js';
import { UnauthorizedError } from '../utils/customErrors.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

class AuthController {
  adminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    logger.info(`Admin login attempt for email: ${email}`);

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

  refreshToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token is required');
    }

    const decoded = await tokenService.verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const tokens = await tokenService.rotateRefreshToken(refreshToken, {
      userId: user._id,
      role: decoded.role,
    });

    user.refreshToken = tokens.refreshToken;
    await user.save();

    tokenService.setRefreshTokenCookie(res, tokens.refreshToken);

    res.status(200).json({
      success: true,
      accessToken: tokens.accessToken,
    });
  });

  logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      try {
        const decoded = await tokenService.verifyRefreshToken(refreshToken);
        await tokenService.blacklistToken(
          refreshToken,
          new Date(decoded.exp * 1000)
        );
      } catch (error) {
        logger.warn('Invalid token during logout:', error.message);
      }
    }

    tokenService.clearRefreshTokenCookie(res);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  });

  verifyToken = asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      user: {
        id: req.user.userId,
        role: req.user.role,
      },
    });
  });
}

export default new AuthController();
