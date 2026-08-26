import { orderService } from '../services/order.service.js';
import { paymentService } from '../services/payment.service.js';
import { config } from '../config/env.js';

function getBaseUrl(req) {
  if (config.baseUrl) return config.baseUrl.replace(/\/$/, '');
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${protocol}://${host}`;
}

export const paymentController = {
  /**
   * Crea una orden de tarjeta de invitación y su preferencia de Mercado Pago
   */
  async createPreference(req, res) {
    try {
      const baseUrl = getBaseUrl(req);
      const cardData = req.body?.cardData || {};

      const order = orderService.createOrder(
        {
          ip: req.ip,
          userAgent: req.get('User-Agent')
        },
        cardData
      );

      const preferenceResult = await paymentService.createPreference(order, baseUrl);

      return res.status(201).json({
        success: true,
        orderId: order.id,
        item: order.item,
        amount: order.amount,
        currency: order.currency,
        preferenceId: preferenceResult.preferenceId,
        initPoint: preferenceResult.initPoint,
        sandboxInitPoint: preferenceResult.sandboxInitPoint,
        isMock: preferenceResult.isMock
      });
    } catch (error) {
      console.error('[PaymentController] Error creando preferencia:', error);
      return res.status(500).json({
        success: false,
        error: 'No se pudo iniciar el proceso de pago.',
        details: error.message
      });
    }
  },

  /**
   * Consulta el estado de una orden en tiempo real
   */
  async getOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const order = orderService.getOrder(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Orden no encontrada'
        });
      }

      const isApproved = order.status === 'approved' || order.status === 'delivered';

      return res.json({
        success: true,
        order: {
          id: order.id,
          status: order.status,
          amount: order.amount,
          currency: order.currency,
          createdAt: order.createdAt,
          isApproved,
          accessUrl: isApproved ? `/p/${order.downloadToken}` : null
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Error consultando estado de la orden'
      });
    }
  },

  /**
   * Webhook oficial de Mercado Pago
   */
  async handleWebhook(req, res) {
    try {
      const result = await paymentService.handleWebhook(req.body, req.query);
      return res.status(200).json({ success: true, result });
    } catch (error) {
      console.error('[PaymentController] Error procesando webhook:', error.message);
      return res.status(200).json({ success: false, error: error.message });
    }
  },

  /**
   * Simulador de Pago para testing local y demostración
   */
  async simulatePayment(req, res) {
    try {
      const { orderId } = req.params;
      const order = paymentService.simulatePaymentApproval(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Orden no encontrada para simulación'
        });
      }

      return res.json({
        success: true,
        message: 'Pago simulado aprobado exitosamente.',
        order: {
          id: order.id,
          status: order.status,
          accessUrl: `/p/${order.downloadToken}`
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};
