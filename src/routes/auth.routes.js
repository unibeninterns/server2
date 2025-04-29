import express from 'express';
import authController from '../controllers/auth.controller.js';
import { rateLimiter } from '../middleware/auth.middleware.js';
import validateRequest from '../middleware/validateRequest.js';
import { adminLoginSchema } from '../validators/admin.validators.js';

const router = express.Router();

const standardLimit = rateLimiter(20, 60 * 60 * 1000);

router.post('/admin-login', standardLimit, authController.adminLogin);

export default router;
