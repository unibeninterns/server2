import express from 'express';
import submitController from '../controllers/submit.controller.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { rateLimiter } from '../middleware/auth.middleware.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  staffProposalSchema,
  masterStudentProposalSchema,
} from '../validators/submission.validators.js';

const router = express.Router();
const __dirname = dirname(fileURLToPath(import.meta.url));

// Configure multer for file uploads
export const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Different destinations based on file type
    if (file.fieldname === 'cvFile' || file.fieldname === 'docFile') {
      cb(null, path.join(__dirname, '../uploads/documents/'));
    } else {
      cb(null, path.join(__dirname, '../uploads/'));
    }
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${path.basename(file.originalname)}`);
  },
});

export const fileFilter = (req, file, cb) => {
  // Check file types
  if (file.fieldname === 'cvFile' || file.fieldname === 'docFile') {
    // Document files - PDF, DOC, DOCX
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error('Invalid file type. Only PDF, DOC, and DOCX are allowed.'),
        false
      );
    }
  } else {
    cb(null, true);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

const documentUpload = upload.fields([
  { name: 'cvFile', maxCount: 1 },
  { name: 'docFile', maxCount: 1 },
]);

// Apply rate limiting to all submission endpoints
const submissionRateLimiter = rateLimiter(10, 60 * 60 * 1000); // 10 requests per hour

// Staff proposal submission route
router.post(
  '/staff-proposal',
  submissionRateLimiter,
  documentUpload,
  submitController.submitStaffProposal
);

// Master student proposal submission route
router.post(
  '/master-proposal',
  submissionRateLimiter,
  documentUpload,
  validateRequest(masterStudentProposalSchema),
  submitController.submitMasterStudentProposal
);

// Get user's proposals by email
router.get('/proposals/email/:email', submitController.getUserProposalsByEmail);

// Get proposal by ID
router.get('/proposal/:id', submitController.getProposalById);

export default router;
