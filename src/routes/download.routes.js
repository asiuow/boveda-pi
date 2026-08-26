import { Router } from 'express';
import { downloadController } from '../controllers/download.controller.js';

const router = Router();

// Enlace web directo y protegido (Sin descarga)
router.get('/p/:token', downloadController.viewProduct);
router.get('/v/:token', downloadController.viewProduct);

export default router;
