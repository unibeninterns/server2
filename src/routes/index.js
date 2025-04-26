import { Router } from 'express';
import submitRoutes from './submit.routes.js';
import facultyRoutes from './faculty.routes.js';
import departmentRoutes from './department.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

// Mount route groups
router.use('/submit', submitRoutes);
router.use('/faculties', facultyRoutes);
router.use('/departments', departmentRoutes);
router.use('/admin', adminRoutes);

// Root route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'UNIBEN Research Submission Portal API is running',
  });
});

export default router;
