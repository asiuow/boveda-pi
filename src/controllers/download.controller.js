import { orderService } from '../services/order.service.js';
import { vaultService } from '../services/vault.service.js';
import { tokenService } from '../security/token.service.js';

export const downloadController = {
  /**
   * Visualización universal de la tarjeta (Compatible con WhatsApp preview, iOS, Android, Mac, Windows, Linux)
   */
  async viewProduct(req, res) {
    const idParam = req.params.id || req.params.token;
    
    if (!idParam) {
      return res.status(404).send('Identificador no provisto.');
    }

    // 1. Buscar orden por identificador universal (shortId, ID completo o Token)
    const order = orderService.getOrder(idParam);

    if (!order) {
      const verification = tokenService.verifyToken(idParam, false);
      if (!verification.valid) {
        return res.status(404).send(`
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <title>Te invito a mi fiesta</title>
            <style>
              body { background: #0b0b0f; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
              .card { background: #161620; padding: 30px; border-radius: 16px; border: 1px solid #333; }
              a { color: #ef4444; text-decoration: none; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>🎈 Invitación no disponible</h1>
              <p>El enlace que intentas abrir no existe o ha expirado.</p>
              <a href="/">Crear una nueva tarjeta</a>
            </div>
          </body>
          </html>
        `);
      }
    }

    try {
      const orderId = order ? order.id : idParam;
      const productContent = vaultService.getProtectedProductContent(orderId, order);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=300');
      return res.send(productContent);
    } catch (error) {
      console.error('[DownloadController] Error sirviendo tarjeta:', error);
      return res.status(500).send('Error cargando la tarjeta de invitación.');
    }
  }
};
