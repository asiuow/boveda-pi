import { Router } from 'express';
import { downloadController } from '../controllers/download.controller.js';

const router = Router();

// Descarga directa del archivo con token criptográfico
router.get('/download/:token', downloadController.downloadProduct);

// Visualización directa en pantalla completa con token criptográfico
router.get('/view/:token', downloadController.viewProduct);

export default router;
