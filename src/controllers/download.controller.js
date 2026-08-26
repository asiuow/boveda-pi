import { tokenService } from '../security/token.service.js';
import { vaultService } from '../services/vault.service.js';
import { orderService } from '../services/order.service.js';

export const downloadController = {
  /**
   * Descarga el archivo del producto de forma segura
   */
  async downloadProduct(req, res) {
    const { token } = req.params;
    const verification = tokenService.verifyToken(token, false);

    if (!verification.valid) {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Acceso Denegado | Bóveda Segura</title>
          <style>
            body { background: #0b0b0d; color: #ff5555; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
            .card { background: #16161a; padding: 40px; border-radius: 16px; border: 1px solid #ff444433; max-width: 450px; }
            h1 { font-size: 20px; margin-bottom: 12px; }
            p { color: #888; font-size: 14px; line-height: 1.5; }
            a { color: #ef4444; text-decoration: none; display: inline-block; margin-top: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>🔒 Acceso Denegado a la Bóveda</h1>
            <p>${verification.reason}</p>
            <a href="/">← Volver al inicio</a>
          </div>
        </body>
        </html>
      `);
    }

    try {
      const { orderId } = verification.payload;
      const order = orderService.getOrder(orderId);
      const productContent = vaultService.getProtectedProductContent(orderId, order);

      orderService.markAsDownloaded(orderId);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="animacion-cuadrado-rojo.html"');
      return res.send(productContent);
    } catch (error) {
      return res.status(500).send('Error extrayendo producto de la bóveda.');
    }
  },

  /**
   * Visualización interactiva en vivo del producto tras el pago
   */
  async viewProduct(req, res) {
    const { token } = req.params;
    const verification = tokenService.verifyToken(token, false);

    if (!verification.valid) {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Acceso Denegado | Bóveda Segura</title>
          <style>
            body { background: #0b0b0d; color: #ff5555; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
            .card { background: #16161a; padding: 40px; border-radius: 16px; border: 1px solid #ff444433; max-width: 450px; }
            h1 { font-size: 20px; margin-bottom: 12px; }
            p { color: #888; font-size: 14px; line-height: 1.5; }
            a { color: #ef4444; text-decoration: none; display: inline-block; margin-top: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>🔒 Acceso Denegado a la Bóveda</h1>
            <p>${verification.reason}</p>
            <a href="/">← Volver al inicio</a>
          </div>
        </body>
        </html>
      `);
    }

    try {
      const { orderId } = verification.payload;
      const order = orderService.getOrder(orderId);
      const productContent = vaultService.getProtectedProductContent(orderId, order);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(productContent);
    } catch (error) {
      return res.status(500).send('Error extrayendo producto de la bóveda.');
    }
  }
};
