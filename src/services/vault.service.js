import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VAULT_FILE_PATH = path.join(__dirname, '../vault/product-app.html');

export const vaultService = {
  getProtectedProductContent(orderId, order = {}) {
    if (!fs.existsSync(VAULT_FILE_PATH)) {
      throw new Error('Plantilla de tarjeta no encontrada en la bóveda.');
    }

    let content = fs.readFileSync(VAULT_FILE_PATH, 'utf8');
    const card = order.cardData || {
      eventType: 'cumpleanos',
      name: 'Festejado',
      age: '5',
      photo: '',
      address: 'Av. Corrientes 1234',
      city: 'Buenos Aires',
      province: 'Buenos Aires',
      country: 'Argentina',
      date: 'Sábado',
      time: '18:00 hs'
    };

    const eventLabels = {
      'cumpleanos': {
        ogTitle: 'Te invito a mi fiesta',
        ogDesc: 'Toca para ver la invitación',
        shareText: 'Te invito a mi fiesta',
        badge: card.age ? `¡Cumple ${card.age} Años!` : '¡Feliz Cumpleaños!',
        headline: '¡Te invito a celebrar mi cumpleaños juntos! 🎂🎈',
        themeColor: '#ef4444'
      },
      'bautismo': {
        ogTitle: 'Te invito a mi fiesta',
        ogDesc: 'Toca para ver la invitación',
        shareText: 'Te invito a mi fiesta',
        badge: 'Mi Bautismo 🕊️',
        headline: 'Te invito a compartir este momento tan especial y bendecido ✨',
        themeColor: '#0ea5e9'
      },
      'asado': {
        ogTitle: 'Te invito a mi fiesta',
        ogDesc: 'Toca para ver la invitación',
        shareText: 'Te invito a mi fiesta',
        badge: '¡Gran Asado! 🥩🔥',
        headline: '¡Se prende el fuego! Te invito a compartir un gran asado 🍷',
        themeColor: '#f97316'
      },
      'evento': {
        ogTitle: 'Te invito a mi fiesta',
        ogDesc: 'Toca para ver la invitación',
        shareText: 'Te invito a mi fiesta',
        badge: 'Evento Especial 🌟',
        headline: '¡Estás cordialmente invitado a celebrar con nosotros! 🥂',
        themeColor: '#8b5cf6'
      },
      'casamiento': {
        ogTitle: 'Te invito a mi fiesta',
        ogDesc: 'Toca para ver la invitación',
        shareText: 'Te invito a mi fiesta',
        badge: '¡Nos Casamos! 💍💐',
        headline: '¡El día más feliz de nuestras vidas! Acompáñanos a festejar 🥂',
        themeColor: '#ec4899'
      },
      'graduacion': {
        ogTitle: 'Te invito a mi fiesta',
        ogDesc: 'Toca para ver la invitación',
        shareText: 'Te invito a mi fiesta',
        badge: '¡Graduación! 🎓🎉',
        headline: '¡Objetivo cumplido! Ven a festejar mi graduación con todo 🎓✨',
        themeColor: '#3b82f6'
      },
      'pizza': {
        ogTitle: 'Te invito a mi fiesta',
        ogDesc: 'Toca para ver la invitación',
        shareText: 'Te invito a mi fiesta',
        badge: '¡Pizza Party! 🍕🍻',
        headline: '¡Pizzas calientes, buena música y amigos! No faltes 🍕✨',
        themeColor: '#eab308'
      },
      'poolparty': {
        ogTitle: 'Te invito a mi fiesta',
        ogDesc: 'Toca para ver la invitación',
        shareText: 'Te invito a mi fiesta',
        badge: '¡Pool Party! ☀️🏊‍♂️',
        headline: '¡Trae malla, toalla y ganas de festejar al sol! 🏖️💦',
        themeColor: '#14b8a6'
      },
      'tematica': {
        ogTitle: 'Te invito a mi fiesta',
        ogDesc: 'Toca para ver la invitación',
        shareText: 'Te invito a mi fiesta',
        badge: '¡Fiesta Temática! 🎭✨',
        headline: '¡Prepara tu mejor look y ven a divertirte con nosotros! 🪩',
        themeColor: '#10b981'
      },
      'cervezada': {
        ogTitle: 'Te invito a mi fiesta',
        ogDesc: 'Toca para ver la invitación',
        shareText: 'Te invito a mi fiesta',
        badge: '¡Cervezada & After! 🍻🥨',
        headline: '¡Cervezas bien frías y amigos para brindar juntos! 🍻',
        themeColor: '#d97706'
      }
    };

    const currentEvent = eventLabels[card.eventType] || eventLabels['cumpleanos'];
    const mapsQueryEncoded = encodeURIComponent(`${card.address}, ${card.city}, ${card.province}, ${card.country}`);

    content = content
      .replace(/{{NAME}}/g, card.name || 'Festejado')
      .replace(/{{AGE}}/g, card.age || '')
      .replace(/{{PHOTO}}/g, card.photo || '')
      .replace(/{{ADDRESS}}/g, card.address || 'Av. Principal 123')
      .replace(/{{CITY}}/g, card.city || 'Buenos Aires')
      .replace(/{{PROVINCE}}/g, card.province || 'Buenos Aires')
      .replace(/{{COUNTRY}}/g, card.country || 'Argentina')
      .replace(/{{MAPS_QUERY_ENCODED}}/g, mapsQueryEncoded)
      .replace(/{{DATE}}/g, card.date || 'Sábado')
      .replace(/{{TIME}}/g, card.time || '18:00 hs')
      .replace(/{{EVENT_TYPE}}/g, card.eventType || 'cumpleanos')
      .replace(/{{OG_TITLE}}/g, currentEvent.ogTitle)
      .replace(/{{OG_DESC}}/g, currentEvent.ogDesc)
      .replace(/{{SHARE_SHORT_TEXT}}/g, currentEvent.shareText)
      .replace(/{{BADGE_TEXT}}/g, currentEvent.badge)
      .replace(/{{HEADLINE_TEXT}}/g, currentEvent.headline)
      .replace(/{{THEME_COLOR}}/g, currentEvent.themeColor)
      .replace(/{{ORDER_ID}}/g, orderId ? orderId.slice(0, 8) : 'VERIFIED');

    return content;
  }
};
