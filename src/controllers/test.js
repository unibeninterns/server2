adminLogin = asyncHandler(async (req, res) => {
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
  logger.info(user);

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
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      logger.warn('Refresh token attempt without token');
      throw new UnauthorizedError('Refresh token required');
    }

    logger.info(
      `Refresh token attempt with token: ${refreshToken.substring(0, 8)}...`
    );

    const payload = await tokenService.verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.userId).select('+refreshToken');
    logger.info(user, refreshToken, user.refreshToken);

    if (!user || user.refreshToken !== refreshToken) {
      logger.warn(
        `Invalid refresh token attempt for user ID: ${payload.userId}`
      );
      throw new UnauthorizedError('Invalid refresh token');
    }

    const tokens = await tokenService.rotateRefreshToken(refreshToken, {
      userId: String(user._id),
      email: user.email,
      role: user.role,
    });

    user.refreshToken = tokens.refreshToken;
    await user.save();

    tokenService.setRefreshTokenCookie(res, tokens.refreshToken);
    logger.info(`Token refreshed successfully for user: ${user.email}`);

    res.json({
      success: true,
      accessToken: tokens.accessToken,
    });
  });

  verifyToken = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    logger.info(`Token verification request for user ID: ${userId}`);

    const user = await User.findById(userId);
    if (!user) {
      logger.warn(
        `Token verification failed: User not found with ID ${userId}`
      );
      throw new UnauthorizedError('User not found');
    }

    logger.info(`Token verified successfully for user: ${user.email}`);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        faculty: user.faculty,
        title: user.title,
        profilePicture: user.profilePicture,
      },
    });
  });

  logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      logger.debug(
        `Logout request with token: ${refreshToken.substring(0, 8)}...`
      );
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = undefined;
        await user.save();
        logger.info(`User logged out: ${user.email}`);
      }
    }

    tokenService.clearRefreshTokenCookie(res);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  });
}