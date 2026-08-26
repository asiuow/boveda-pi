import app from '../src/app.js';
import http from 'http';

const TEST_PORT = 7895;

async function runTests() {
  console.log('--- TEST: COMPATIBILIDAD UNIVERSAL (iOS, ANDROID, MAC, WINDOWS, LINUX) ---');
  
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${TEST_PORT}`;

  try {
    // 1. Crear orden con datos
    const cardData = {
      name: 'Lucas',
      age: '10',
      address: 'San Martin 500',
      city: 'Rosario',
      date: 'Viernes 25',
      time: '19:00 hs'
    };

    const createRes = await fetch(`${baseUrl}/api/create-preference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardData })
    });
    const createData = await createRes.json();
    console.log('✅ Orden creada:', createData.orderId, 'ShortId:', createData.shortId);

    // 2. Simular pago aprobado
    const simRes = await fetch(`${baseUrl}/api/simulate-payment/${createData.orderId}`, { method: 'POST' });
    const simData = await simRes.json();
    console.log('✅ URL Universal generada:', simData.order.accessUrl);

    if (!simData.order.accessUrl.includes('/tarjeta/')) {
      throw new Error('Debe usar el formato limpio universal /tarjeta/:shortId');
    }

    // 3. Probar ruta universal /tarjeta/:shortId
    const viewRes = await fetch(`${baseUrl}${simData.order.accessUrl}`);
    if (viewRes.status !== 200) {
      throw new Error(`Status inesperado: ${viewRes.status}`);
    }
    const html = await viewRes.text();

    if (!html.includes('Lucas') || !html.includes('10 Años') || !html.includes('Rosario')) {
      throw new Error('Faltan datos en la tarjeta universal');
    }
    console.log('✅ Tarjeta /tarjeta/:shortId responde HTTP 200 con datos inyectados.');

    // 4. Probar metadatos OpenGraph (para WhatsApp en móviles)
    if (!html.includes('og:title') || !html.includes('og:description')) {
      throw new Error('Faltan metadatos OpenGraph para previsualización en WhatsApp');
    }
    console.log('✅ Metadatos OpenGraph para WhatsApp / iMessage verificados.');

    // 5. Probar compatibilidad de ruta corta alternativa /t/:shortId
    const shortRes = await fetch(`${baseUrl}/t/${createData.shortId}`);
    if (shortRes.status !== 200) {
      throw new Error('Fallo en ruta corta /t/:shortId');
    }
    console.log('✅ Ruta corta /t/:shortId responde HTTP 200.');

    console.log('\n🎉 TODAS LAS PRUEBAS DE COMPATIBILIDAD UNIVERSAL PASARON CON ÉXITO\n');
  } finally {
    server.close();
  }
}

runTests().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
