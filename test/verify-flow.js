import app from '../src/app.js';
import http from 'http';

const TEST_PORT = 7897;

async function runTests() {
  console.log('--- TEST: SUPRESIÓN DE CAJA SUPERIOR DE WHATSAPP Y ENLACE LIMPIO ---');
  
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${TEST_PORT}`;

  try {
    // 1. Crear orden
    const cardData = {
      eventType: 'cumpleanos',
      name: 'Ana',
      age: '30',
      address: 'Suiza 886',
      city: 'Junín',
      province: 'Buenos Aires',
      country: 'Argentina',
      date: '15 de Noviembre',
      time: '17:00 hs'
    };

    const createRes = await fetch(`${baseUrl}/api/create-preference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardData })
    });
    const createData = await createRes.json();
    console.log('✅ Orden creada:', createData.orderId, 'ShortId:', createData.shortId);

    // 2. Simular pago
    const simRes = await fetch(`${baseUrl}/api/simulate-payment/${createData.orderId}`, { method: 'POST' });
    const simData = await simRes.json();
    console.log('✅ Enlace generado:', simData.order.accessUrl);

    // 3. Verificar que un navegador móvil / usuario reciba 200 OK con la tarjeta
    const userRes = await fetch(`${baseUrl}${simData.order.accessUrl}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)' }
    });
    if (userRes.status !== 200) {
      throw new Error(`Status inesperado para usuario: ${userRes.status}`);
    }
    const html = await userRes.text();
    if (!html.includes('Ana') || !html.includes('Suiza 886')) {
      throw new Error('Faltan datos en la tarjeta para el usuario');
    }
    console.log('✅ Usuario en navegador recibe 200 OK con la tarjeta completa.');

    // 4. Verificar que el bot de vista previa de WhatsApp reciba 404 (para eliminar la caja superior de vista previa)
    const botRes = await fetch(`${baseUrl}${simData.order.accessUrl}`, {
      headers: { 'User-Agent': 'facebookexternalhit/1.1 (+https://www.facebook.com/externalhit_uatext.php)' }
    });
    if (botRes.status !== 404) {
      throw new Error(`El bot de WhatsApp debería recibir 404, recibió: ${botRes.status}`);
    }
    console.log('✅ Bot de WhatsApp recibe 404: La caja superior queda 100% eliminada.');

    console.log('\n🎉 TODAS LAS PRUEBAS PASARON CON ÉXITO\n');
  } finally {
    server.close();
  }
}

runTests().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
