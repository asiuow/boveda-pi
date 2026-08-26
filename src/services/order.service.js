import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env.js';
import { tokenService } from '../security/token.service.js';

class OrderService {
  constructor() {
    this.orders = new Map();
  }

  /**
   * Crea una nueva orden con los datos de la tarjeta de invitación
   */
  createOrder(metadata = {}, cardData = {}) {
    const orderId = uuidv4();
    const order = {
      id: orderId,
      status: 'pending',
      item: {
        ...config.item,
        title: `Tarjeta Digital de Cumpleaños - ${cardData.name || 'Personalizada'}`,
        description: `Invitación interactiva para ${cardData.name || 'el cumpleañero'} (${cardData.age || ''} años)`
      },
      amount: config.item.unitPrice,
      currency: config.item.currencyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preferenceId: null,
      paymentId: null,
      downloadToken: null,
      cardData: {
        name: (cardData.name || 'Cumpleañero').slice(0, 20),
        age: cardData.age || '1',
        photo: cardData.photo || '',
        address: cardData.address || 'Av. Principal 123',
        city: cardData.city || 'Buenos Aires',
        date: cardData.date || 'Sábado',
        time: cardData.time || '18:00 hs'
      },
      metadata
    };

    this.orders.set(orderId, order);
    return order;
  }

  getOrder(orderId) {
    return this.orders.get(orderId) || null;
  }

  setPreferenceId(orderId, preferenceId) {
    const order = this.getOrder(orderId);
    if (order) {
      order.preferenceId = preferenceId;
      order.updatedAt = new Date().toISOString();
    }
    return order;
  }

  approveOrder(orderId, paymentDetails = {}) {
    const order = this.getOrder(orderId);
    if (!order) return null;

    order.status = 'approved';
    order.paymentId = paymentDetails.id || null;
    order.paymentMethod = paymentDetails.payment_type_id || 'mercadopago';
    order.updatedAt = new Date().toISOString();
    order.downloadToken = tokenService.generateDownloadToken(orderId);

    console.log(`[OrderService] Orden ${orderId} APROBADA. Tarjeta digital generada.`);
    return order;
  }
}

export const orderService = new OrderService();
