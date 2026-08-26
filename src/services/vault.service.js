import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VAULT_FILE_PATH = path.join(__dirname, '../vault/product-app.html');

export const vaultService = {
  /**
   * Obtiene el contenido de la tarjeta de invitación inyectando los datos del homenajeado
   */
  getProtectedProductContent(orderId, order = {}) {
    if (!fs.existsSync(VAULT_FILE_PATH)) {
      throw new Error('Plantilla de tarjeta no encontrada en la bóveda.');
    }

    let content = fs.readFileSync(VAULT_FILE_PATH, 'utf8');
    const card = order.cardData || {
      name: 'Cumpleañero',
      age: '1',
      photo: '',
      address: 'Av. Principal 123',
      city: 'Buenos Aires',
      date: 'Sábado',
      time: '18:00 hs'
    };

    // Inyectar datos en el HTML
    content = content
      .replace(/{{NAME}}/g, card.name || 'Cumpleañero')
      .replace(/{{AGE}}/g, card.age || '1')
      .replace(/{{PHOTO}}/g, card.photo || '')
      .replace(/{{ADDRESS}}/g, card.address || 'Av. Principal 123')
      .replace(/{{CITY}}/g, card.city || 'Buenos Aires')
      .replace(/{{DATE}}/g, card.date || 'Sábado')
      .replace(/{{TIME}}/g, card.time || '18:00 hs')
      .replace(/{{ORDER_ID}}/g, orderId ? orderId.slice(0, 8) : 'VERIFIED');

    return content;
  }
};
