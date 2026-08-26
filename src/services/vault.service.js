import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VAULT_FILE_PATH = path.join(__dirname, '../vault/product-app.html');

export const vaultService = {
  /**
   * Obtiene el contenido protegido del producto inyectando metadatos de compra
   */
  getProtectedProductContent(orderId, orderDetails = {}) {
    if (!fs.existsSync(VAULT_FILE_PATH)) {
      throw new Error('Archivo de producto no encontrado en la bóveda.');
    }

    let content = fs.readFileSync(VAULT_FILE_PATH, 'utf8');

    // Inyectar sello criptográfico único de la orden
    const stamp = `Licencia: ORD-${orderId.slice(0, 8)} • Emitido: ${new Date().toLocaleDateString('es-AR')} • Titular: pi.juguetes`;
    content = content.replace('Bóveda Digital Blindada • Token Verificado • Mercado Pago OK', stamp);

    return content;
  }
};
