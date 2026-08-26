import app from '../src/app.js';
import http from 'http';

const TEST_PORT = 7893;

async function runTests() {
  console.log('--- TEST: CUADRADO 2D FLAT, RUTA LIMPIA /p/:token Y SIN DESCARGAS ---');
  
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${TEST_PORT}`;

  try {
    // 1. Crear orden
    const createRes = await fetch(`${baseUrl}/api/create-preference`, { method: 'POST' });
    const createData = await createRes.json();
    console.log('✅ Orden creada:', createData.orderId);

    // 2. Simular pago aprobado
    const simRes = await fetch(`${baseUrl}/api/simulate-payment/${createData.orderId}`, { method: 'POST' });
    const simData = await simRes.json();
    console.log('✅ Enlace web generado:', simData.order.accessUrl);

    if (!simData.order.accessUrl.startsWith('/p/')) {
      throw new Error('La ruta debe ser limpia /p/:token sin subcarpetas');
    }

    // 3. Abrir enlace web generado
    const viewRes = await fetch(`${baseUrl}${simData.order.accessUrl}`);
    if (viewRes.status !== 200) {
      throw new Error(`Status inesperado: ${viewRes.status}`);
    }
    const html = await viewRes.text();
    if (!html.includes('square-2d') || !html.includes('pi.juguetes')) {
      throw new Error('El contenido no coincide con el cuadrado 2D flat');
    }
    console.log('✅ Enlace web /p/:token sirve el cuadrado 2D flat correctamente.');

    // 4. Verificar que no se pueda acceder con token inválido
    const invalidRes = await fetch(`${baseUrl}/p/token_invalido`);
    if (invalidRes.status !== 403) {
      throw new Error('Debería retornar 403 para token inválido');
    }
    console.log('✅ Seguridad de token protegida (403).');

    console.log('\n🎉 TODAS LAS PRUEBAS PASARON EXITOSAMENTE\n');
  } finally {
    server.close();
  }
}

runTests().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
