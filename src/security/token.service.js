import crypto from 'crypto';
import { config } from '../config/env.js';

const usedNonces = new Set();
const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutos de vigencia

export const tokenService = {
  /**
   * Genera un token HMAC-SHA256 firmado, efímero e infalsificable.
   */
  generateDownloadToken(orderId) {
    const nonce = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const payload = {
      orderId,
      timestamp,
      nonce
    };

    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', config.vaultSecret)
      .update(payloadBase64)
      .digest('base64url');

    return `${payloadBase64}.${signature}`;
  },

  /**
   * Verifica la integridad, firma y vigencia del token.
   */
  verifyToken(token, markAsConsumed = false) {
    if (!token || typeof token !== 'string') {
      return { valid: false, reason: 'Token no provisto o inválido' };
    }

    const parts = token.split('.');
    if (parts.length !== 2) {
      return { valid: false, reason: 'Formato de token no reconocido' };
    }

    const [payloadBase64, signature] = parts;

    // Verificar firma criptográfica
    const expectedSignature = crypto
      .createHmac('sha256', config.vaultSecret)
      .update(payloadBase64)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false, reason: 'Firma criptográfica inválida (Token alterado o ilegítimo)' };
    }

    try {
      const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
      const now = Date.now();

      // Verificar expiración
      if (now - payload.timestamp > TOKEN_TTL_MS) {
        return { valid: false, reason: 'El token ha expirado. Por favor, solicita uno nuevo.' };
      }

      // Verificar si ya fue consumido (prevención de replay)
      if (usedNonces.has(payload.nonce)) {
        return { valid: false, reason: 'Este enlace de descarga ya fue utilizado previamente.' };
      }

      if (markAsConsumed) {
        usedNonces.add(payload.nonce);
        // Limpieza automática tras expiración del TTL
        setTimeout(() => usedNonces.delete(payload.nonce), TOKEN_TTL_MS);
      }

      return { valid: true, payload };
    } catch (e) {
      return { valid: false, reason: 'Error al decodificar carga del token' };
    }
  }
};
