import express from 'express';
import submitController from '../controllers/submit.controller.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { rateLimiter } from '../middleware/auth.middleware.js';

const router = express.Router();
const __dirname = dirname(fileURLToPath(import.meta.url));

// Configure multer for file uploads
export const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Different destinations based on file type
    if (file.fieldname === 'profilePicture') {
      cb(null, path.join(__dirname, '../uploads/profiles/'));
    } else if (file.fieldname === 'cvFile' || file.fieldname === 'budgetFile') {
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
  // Check file types based on fieldname
  if (file.fieldname === 'profilePicture') {
    // Image files only
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error('Invalid file type. Only JPEG, PNG and JPG are allowed.'),
        false
      );
    }
  } else if (file.fieldname === 'cvFile' || file.fieldname === 'budgetFile') {
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
  { name: 'budgetFile', maxCount: 1 },
]);

// Apply rate limiting to all submission endpoints
const submissionRateLimiter = rateLimiter(10, 60 * 60 * 1000); // 10 requests per hour

// Profile completion route (existing)
router.post(
  '/complete-profile',
  upload.single('profilePicture'),
  submitController.completeProfile
);

// Faculty proposal submission route
router.post(
  '/faculty-proposal',
  submissionRateLimiter,
  documentUpload,
  submitController.submitFacultyProposal
);

// Master student proposal submission route
router.post(
  '/master-proposal',
  submissionRateLimiter,
  documentUpload,
  submitController.submitMasterStudentProposal
);

// Get all proposals (admin only)
router.get('/proposals', submitController.getAllProposals);

// Get user's own proposals
router.get('/my-proposals', submitController.getUserProposals);

// Get proposal by ID
router.get('/proposal/:id', submitController.getProposalById);

export default router;
