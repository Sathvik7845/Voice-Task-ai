import { Router } from 'express';
import { extractTaskController, healthCheckController } from '../controllers/taskController.js';

const router = Router();

// Health check route
router.get('/health', healthCheckController);

// Extract task route
router.post('/tasks/extract', extractTaskController);

export default router;
