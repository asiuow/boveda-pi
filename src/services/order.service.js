import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env.js';
import { tokenService } from '../security/token.service.js';

class OrderService {
  constructor() {
    this.orders = new Map();
  }

  /**
   * Crea una nueva orden de compra pendiente
   */
  createOrder(metadata = {}) {
    const orderId = uuidv4();
    const order = {
      id: orderId,
      status: 'pending', // 'pending' | 'approved' | 'rejected' | 'delivered'
      item: { ...config.item },
      amount: config.item.unitPrice,
      currency: config.item.currencyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preferenceId: null,
      paymentId: null,
      downloadToken: null,
      metadata
    };

    this.orders.set(orderId, order);
    return order;
  }

  /**
   * Obtiene una orden por su ID
   */
  getOrder(orderId) {
    return this.orders.get(orderId) || null;
  }

  /**
   * Asocia el preferenceId de Mercado Pago a la orden
   */
  setPreferenceId(orderId, preferenceId) {
    const order = this.getOrder(orderId);
    if (order) {
      order.preferenceId = preferenceId;
      order.updatedAt = new Date().toISOString();
    }
    return order;
  }

  /**
   * Marca la orden como aprobada y emite el token de descarga
   */
  approveOrder(orderId, paymentDetails = {}) {
    const order = this.getOrder(orderId);
    if (!order) return null;

    order.status = 'approved';
    order.paymentId = paymentDetails.id || null;
    order.paymentMethod = paymentDetails.payment_type_id || 'mercadopago';
    order.updatedAt = new Date().toISOString();
    
    // Generar token seguro para descarga
    order.downloadToken = tokenService.generateDownloadToken(orderId);

    console.log(`[OrderService] Orden ${orderId} APROBADA. Token de descarga generado.`);
    return order;
  }

  /**
   * Marca la orden como descargada
   */
  markAsDownloaded(orderId) {
    const order = this.getOrder(orderId);
    if (order) {
      order.status = 'delivered';
      order.updatedAt = new Date().toISOString();
    }
    return order;
  }
}

export const orderService = new OrderService();
