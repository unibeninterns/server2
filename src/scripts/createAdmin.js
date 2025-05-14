import User from '../model/user.model.js';
import connectDB from '../db/database.js';
import validateEnv from '../utils/validateEnv.js';
import logger from '../utils/logger.js';

validateEnv();

export const createAdminUser = async () => {
  try {
    await connectDB();
    logger.info('Connected to database');

    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD)
      return logger.error('Add admin info to the .env records.');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });

    if (adminExists) {
      return logger.info('Admin user already exists');
      //process.exit(0);
    }

    // Create admin user with required fields
    const admin = await User.create({
      name: process.env.ADMIN_NAME || 'System Administrator',
      email: process.env.ADMIN_EMAIL.endsWith('.uniben.edu')
        ? process.env.ADMIN_EMAIL
        : `${process.env.ADMIN_EMAIL.split('@')[0]}@admin.uniben.edu`,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
      isActive: true,
      phoneNumber: process.env.ADMIN_PHONE || '0000000000', // Default value if not provided
      userType: 'staff', // Default as staff since it's required
    });

    return logger.info(`Admin user created with email: ${admin.email}`);
  } catch (error) {
    return logger.error('Error creating admin user:', error);
  }
};

createAdminUser();
