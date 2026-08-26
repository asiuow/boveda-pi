import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '7860', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mpAccessToken: process.env.MP_ACCESS_TOKEN || '',
  baseUrl: process.env.BASE_URL || '',
  vaultSecret: process.env.VAULT_SECRET_KEY || 'boveda_pi_juguetes_secret_key_fixed_2026_super_secure',
  item: {
    id: 'prod-tarjeta-cumple-01',
    title: 'Tarjeta Digital de Cumpleaños Interactiva',
    description: 'Invitación con música festiva, mapa gráfico y foto personalizada.',
    unitPrice: parseFloat(process.env.ITEM_PRICE || '10.00'),
    currencyId: 'ARS',
    quantity: 1
  }
};
