import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { config } from './env.js';

let client = null;
let preferenceClient = null;
let paymentClient = null;
let isConfigured = false;

if (config.mpAccessToken && config.mpAccessToken.trim().length > 10) {
  try {
    client = new MercadoPagoConfig({
      accessToken: config.mpAccessToken.trim(),
      options: { timeout: 5000 }
    });
    preferenceClient = new Preference(client);
    paymentClient = new Payment(client);
    isConfigured = true;
    console.log('[MercadoPago] SDK Inicializado correctamente con Access Token.');
  } catch (err) {
    console.error('[MercadoPago] Error inicializando SDK:', err.message);
  }
} else {
  console.log('[MercadoPago] Sin Access Token configurado. Modo DEMO/Simulador activo (puedes agregar MP_ACCESS_TOKEN en .env).');
}

export { client, preferenceClient, paymentClient, isConfigured };
