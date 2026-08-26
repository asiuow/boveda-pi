import app from '../src/app.js';
import http from 'http';

const TEST_PORT = 7894;

async function runTests() {
  console.log('--- TEST: ASISTENTE DE TARJETAS, MAPA Y MÚSICA DE CUMPLEAÑOS ---');
  
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${TEST_PORT}`;

  try {
    // 1. Crear orden con datos de la tarjeta de cumpleaños
    const cardData = {
      name: 'Mateo',
      age: '5',
      address: 'Av. Corrientes 1234',
      city: 'Buenos Aires',
      date: 'Sábado 15 de Noviembre',
      time: '17:30 hs'
    };

    const createRes = await fetch(`${baseUrl}/api/create-preference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardData })
    });
    const createData = await createRes.json();
    console.log('✅ Orden creada con ID:', createData.orderId);

    // 2. Simular pago aprobado de $10
    const simRes = await fetch(`${baseUrl}/api/simulate-payment/${createData.orderId}`, { method: 'POST' });
    const simData = await simRes.json();
    console.log('✅ Tarjeta desbloqueada en ruta:', simData.order.accessUrl);

    // 3. Verificar contenido de la tarjeta desbloqueada
    const cardRes = await fetch(`${baseUrl}${simData.order.accessUrl}`);
    if (cardRes.status !== 200) {
      throw new Error(`Error en tarjeta: status ${cardRes.status}`);
    }
    const html = await cardRes.text();

    if (!html.includes('Mateo') || !html.includes('5 Años') || !html.includes('Av. Corrientes 1234')) {
      throw new Error('La tarjeta no contiene los datos personalizados inyectados');
    }
    console.log('✅ Datos personalizados inyectados correctamente (Nombre, Edad, Lugar).');

    if (!html.includes('celebration.mp3') || !html.includes('openstreetmap')) {
      throw new Error('La tarjeta no contiene el reproductor de audio o el mapa gráfico');
    }
    console.log('✅ Reproductor de música y mapa gráfico presentes en la tarjeta.');

    console.log('\n🎉 TODAS LAS PRUEBAS DEL CREADOR DE TARJETAS PASARON CON ÉXITO\n');
  } finally {
    server.close();
  }
}

runTests().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
