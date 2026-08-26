import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller.js';

const router = Router();

// Iniciar orden y obtener checkout de Mercado Pago
router.post('/create-preference', paymentController.createPreference);

// Consultar estado de la orden (polling del frontend)
router.get('/order-status/:orderId', paymentController.getOrderStatus);

// Webhook oficial de Mercado Pago (IPN / Webhooks v1 y v2)
router.post('/webhook', paymentController.handleWebhook);
router.get('/webhook', paymentController.handleWebhook); // MP a veces valida con GET

// Simulador de pago para pruebas de desarrollo
router.post('/simulate-payment/:orderId', paymentController.simulatePayment);

export default router;
