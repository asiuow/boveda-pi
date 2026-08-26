import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env.js';
import { tokenService } from '../security/token.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../../data/orders.json');

class OrderService {
  constructor() {
    this.orders = new Map();
    this.loadFromDisk();
  }

  loadFromDisk() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const list = JSON.parse(raw);
        for (const ord of list) {
          if (ord && ord.id) {
            this.orders.set(ord.id, ord);
          }
        }
        console.log(`[OrderService] ${this.orders.size} órdenes cargadas desde el almacenamiento persistente.`);
      }
    } catch (e) {
      console.warn('[OrderService] Error cargando órdenes de disco:', e.message);
    }
  }

  saveToDisk() {
    try {
      const list = Array.from(this.orders.values());
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify(list, null, 2), 'utf8');
    } catch (e) {
      console.error('[OrderService] Error guardando en disco:', e.message);
    }
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
    this.saveToDisk();
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
      this.saveToDisk();
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

    this.saveToDisk();
    console.log(`[OrderService] Orden ${orderId} APROBADA y guardada en persistencia.`);
    return order;
  }
}

export const orderService = new OrderService();
