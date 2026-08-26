import { Router } from 'express';
import { downloadController } from '../controllers/download.controller.js';

const router = Router();

// Rutas universales compatibles con iOS, Android, Mac, Windows, Linux y WhatsApp
router.get('/tarjeta/:id', downloadController.viewProduct);
router.get('/t/:id', downloadController.viewProduct);
router.get('/p/:id', downloadController.viewProduct);
router.get('/v/:id', downloadController.viewProduct);

export default router;
