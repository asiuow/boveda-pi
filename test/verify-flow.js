import app from '../src/app.js';
import http from 'http';

const TEST_PORT = 7896;

async function runTests() {
  console.log('--- TEST: 4 MODELOS DE TARJETAS Y GEOLOCALIZACIÓN PRECISA ---');
  
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${TEST_PORT}`;

  try {
    // 1. Crear orden con modelo 'bautismo' y geolocalización con País y Provincia
    const cardData = {
      eventType: 'bautismo',
      name: 'Joaquín',
      age: '',
      address: 'Av. San Martín 1540',
      city: 'Rosario',
      province: 'Santa Fe',
      country: 'Argentina',
      date: 'Domingo 12 de Octubre',
      time: '11:00 hs'
    };

    const createRes = await fetch(`${baseUrl}/api/create-preference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardData })
    });
    const createData = await createRes.json();
    console.log('✅ Orden Bautismo creada:', createData.orderId, 'ShortId:', createData.shortId);

    // 2. Simular pago
    const simRes = await fetch(`${baseUrl}/api/simulate-payment/${createData.orderId}`, { method: 'POST' });
    const simData = await simRes.json();
    console.log('✅ Enlace generado:', simData.order.accessUrl);

    // 3. Verificar renderizado de la tarjeta con modelo bautismo y geolocalización exacta
    const viewRes = await fetch(`${baseUrl}${simData.order.accessUrl}`);
    if (viewRes.status !== 200) {
      throw new Error(`Error en tarjeta: status ${viewRes.status}`);
    }
    const html = await viewRes.text();

    if (!html.includes('Joaquín') || !html.includes('Bautismo') || !html.includes('Santa Fe') || !html.includes('Argentina')) {
      throw new Error('Faltan datos de evento o ubicación geográfica precisa en la tarjeta');
    }
    console.log('✅ Tarjeta inyectó correctamente Nombre, Bautismo, Provincia (Santa Fe) y País (Argentina).');

    // 4. Verificar enlace de Google Maps con la cadena completa
    if (!html.includes('Av.%20San%20Mart') || !html.includes('Santa%20Fe')) {
      throw new Error('El enlace de Google Maps no contiene la ubicación precisa');
    }
    console.log('✅ Enlace de Google Maps verificado con geolocalización exacta.');

    console.log('\n🎉 TODAS LAS PRUEBAS DE MODELOS Y GEOLOCALIZACIÓN PASARON CON ÉXITO\n');
  } finally {
    server.close();
  }
}

runTests().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
