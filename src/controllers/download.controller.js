import { tokenService } from '../security/token.service.js';
import { vaultService } from '../services/vault.service.js';
import { orderService } from '../services/order.service.js';

export const downloadController = {
  /**
   * Visualización directa y segura del enlace web generado (Sin descarga de archivos)
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
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Acceso Inválido</title>
          <style>
            body { background: #000; color: #ff3333; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
            .box { padding: 30px; border: 1px solid #222; max-width: 400px; }
            h1 { font-size: 18px; margin-bottom: 10px; }
            p { color: #888; font-size: 13px; margin-bottom: 20px; }
            a { color: #ff3333; text-decoration: none; font-size: 14px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>🔒 Enlace no válido o expirado</h1>
            <p>${verification.reason}</p>
            <a href="/">← Ir al inicio</a>
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
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      return res.send(productContent);
    } catch (error) {
      return res.status(500).send('Error cargando recurso.');
    }
  }
};
