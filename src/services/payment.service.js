import { preferenceClient, paymentClient, isConfigured } from '../config/mercadopago.js';
import { config } from '../config/env.js';
import { orderService } from './order.service.js';

export const paymentService = {
  /**
   * Crea una preferencia de pago en Mercado Pago vinculada al external_reference de la orden
   */
  async createPreference(order, baseUrl) {
    if (!isConfigured || !preferenceClient) {
      // Modo Simulador / Sin credenciales de MP configuradas
      const mockInitPoint = `${baseUrl}/?simulated_order=${order.id}&status=ready_to_pay`;
      orderService.setPreferenceId(order.id, `MOCK-PREF-${order.id.slice(0, 8)}`);
      return {
        isMock: true,
        preferenceId: `MOCK-PREF-${order.id.slice(0, 8)}`,
        initPoint: mockInitPoint,
        sandboxInitPoint: mockInitPoint,
        message: 'Modo DEMO/Simulador activo (agrega MP_ACCESS_TOKEN en .env para Mercado Pago real).'
      };
    }

    try {
      const returnUrl = `${baseUrl}/?order_id=${order.id}`;
      const webhookUrl = `${baseUrl}/api/webhook`;

      const preferenceData = {
        body: {
          items: [
            {
              id: order.item.id,
              title: order.item.title,
              description: order.item.description,
              quantity: order.item.quantity,
              unit_price: order.amount,
              currency_id: order.currency
            }
          ],
          external_reference: order.id,
          statement_descriptor: 'PI JUGUETES',
          back_urls: {
            success: returnUrl,
            pending: returnUrl,
            failure: returnUrl
          },
          auto_return: 'approved',
          notification_url: webhookUrl,
          payment_methods: {
            installments: 1
          }
        }
      };

      const response = await preferenceClient.create(preferenceData);
      orderService.setPreferenceId(order.id, response.id);

      return {
        isMock: false,
        preferenceId: response.id,
        initPoint: response.init_point,
        sandboxInitPoint: response.sandbox_init_point
      };
    } catch (error) {
      console.error('[PaymentService] Error al crear preferencia en Mercado Pago:', error);
      throw new Error(`Error en API Mercado Pago: ${error.message || error}`);
    }
  },

  /**
   * Procesa el Webhook oficial de Mercado Pago
   */
  async handleWebhook(body, query) {
    console.log('[Webhook MP] Notificación recibida:', { body, query });

    // Determinar el ID del pago notificado
    const type = body?.type || query?.type || body?.topic || query?.topic;
    const paymentId = body?.data?.id || query?.['data.id'] || query?.id;

    if (!paymentId) {
      return { handled: false, message: 'Notificación sin ID de pago.' };
    }

    if (type && type !== 'payment') {
      return { handled: true, message: `Evento ignorado: tipo '${type}' no es pago.` };
    }

    if (!isConfigured || !paymentClient) {
      return { handled: false, message: 'SDK de Mercado Pago no configurado con Access Token.' };
    }

    try {
      // 1. Consultar a la API de Mercado Pago con el ID recibido para verificar legitimidad
      const payment = await paymentClient.get({ id: paymentId });
      console.log(`[Webhook MP] Pago ${paymentId} verificado con MP. Estado: ${payment.status}`);

      // 2. Comprobar que el estado sea 'approved'
      if (payment.status === 'approved') {
        const orderId = payment.external_reference;
        if (!orderId) {
          console.warn(`[Webhook MP] Pago ${paymentId} aprobado pero sin external_reference.`);
          return { handled: true, message: 'Aprobado sin orden vinculada' };
        }

        // 3. Aprobar orden y generar token de descarga
        const order = orderService.approveOrder(orderId, payment);
        return { handled: true, approved: true, orderId: order?.id };
      }

      return { handled: true, status: payment.status };
    } catch (error) {
      console.error('[Webhook MP] Error al consultar pago en Mercado Pago:', error.message);
      throw error;
    }
  },

  /**
   * Simulación local de pago para testing y desarrollo
   */
  simulatePaymentApproval(orderId) {
    const order = orderService.getOrder(orderId);
    if (!order) {
      return null;
    }

    return orderService.approveOrder(orderId, {
      id: `SIMULATED-PAY-${Date.now()}`,
      payment_type_id: 'simulated_credit_card'
    });
  }
};
