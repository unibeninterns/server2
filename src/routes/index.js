import { Router } from 'express';
import submitRoutes from './submit.routes.js';

const router = Router();

// Mount route groups
router.use('/submit', submitRoutes);

// Root route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Research Portal API is running',
  });
});

export default router;
