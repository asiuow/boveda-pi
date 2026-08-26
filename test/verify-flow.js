import app from '../src/app.js';
import http from 'http';

const TEST_PORT = 7898;

async function runTests() {
  console.log('--- TEST: VISTA PREVIA WHATSAPP - TE INVITO A MI FIESTA ---');
  
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${TEST_PORT}`;

  try {
    // 1. Crear orden
    const cardData = {
      eventType: 'cumpleanos',
      name: 'Mau',
      age: '33',
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

    // 3. Verificar que WhatsApp preview reciba 200 OK con 'Te invito a mi fiesta'
    const waRes = await fetch(`${baseUrl}${simData.order.accessUrl}`, {
      headers: { 'User-Agent': 'facebookexternalhit/1.1 (+https://www.facebook.com/externalhit_uatext.php)' }
    });
    if (waRes.status !== 200) {
      throw new Error(`Status inesperado: ${waRes.status}`);
    }
    const html = await waRes.text();

    if (!html.includes('Te invito a mi fiesta')) {
      throw new Error('Debe contener Te invito a mi fiesta');
    }
    console.log('✅ WhatsApp crawler recibe 200 OK con título "Te invito a mi fiesta".');

    console.log('\n🎉 PRUEBAS PASARON CON ÉXITO\n');
  } finally {
    server.close();
  }
}

runTests().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
