import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '7860', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mpAccessToken: process.env.MP_ACCESS_TOKEN || '',
  baseUrl: process.env.BASE_URL || '',
  vaultSecret: process.env.VAULT_SECRET_KEY || crypto.randomBytes(32).toString('hex'),
  item: {
    id: 'prod-cube-red-01',
    title: 'Animación Digital - Cuadrado Rojo Giratorio',
    description: 'Acceso seguro y descarga de la web interactiva con animación 3D de cuadrado rojo sobre negro.',
    unitPrice: parseFloat(process.env.ITEM_PRICE || '10.00'),
    currencyId: 'ARS',
    quantity: 1
  }
};
