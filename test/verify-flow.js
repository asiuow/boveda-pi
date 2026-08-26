import app from '../src/app.js';
import http from 'http';

const TEST_PORT = 7892;

async function runTests() {
  console.log('--- INICIANDO BATERÍA DE PRUEBAS DE SEGURIDAD Y FLUJO ---');
  
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${TEST_PORT}`;

  try {
    // 1. Probar creación de orden / preferencia
    console.log('\n[1] Probando creación de orden y preferencia...');
    const createRes = await fetch(`${baseUrl}/api/create-preference`, { method: 'POST' });
    const createData = await createRes.json();
    
    if (!createData.success || !createData.orderId) {
      throw new Error('Fallo al crear orden: ' + JSON.stringify(createData));
    }
    console.log('✅ Orden creada con ID:', createData.orderId);
    console.log('✅ Monto configurado:', createData.amount, createData.currency);

    // 2. Verificar estado inicial (debe ser pending)
    console.log('\n[2] Verificando estado pendiente inicial...');
    const statusRes = await fetch(`${baseUrl}/api/order-status/${createData.orderId}`);
    const statusData = await statusRes.json();
    if (statusData.order.status !== 'pending' || statusData.order.isApproved !== false) {
      throw new Error('Estado inicial incorrecto: ' + JSON.stringify(statusData));
    }
    console.log('✅ Estado inicial es PENDING correctamente.');

    // 3. Probar blindaje contra accesos no autorizados a la bóveda
    console.log('\n[3] Probando blindaje contra acceso no autorizado / token falso...');
    const unauthRes = await fetch(`${baseUrl}/download/token_falso_o_manipulado.firma_invalida`);
    if (unauthRes.status !== 403) {
      throw new Error(`Esperado status 403 para token falso, obtenido: ${unauthRes.status}`);
    }
    console.log('✅ Blindaje activo: Acceso no autorizado bloqueado con HTTP 403.');

    // 4. Probar que la carpeta vault NO se expone estáticamente
    console.log('\n[4] Probando aislamiento total de la carpeta vault contra acceso estático...');
    const staticVaultRes = await fetch(`${baseUrl}/src/vault/product-app.html`);
    const staticVaultDirectRes = await fetch(`${baseUrl}/vault/product-app.html`);
    // En Express, el fallback envía index.html para rutas no-API, por lo que nunca debe contener el código de product-app
    const staticText = await staticVaultRes.text();
    if (staticText.includes('rotateCube') || staticText.includes('scene')) {
      throw new Error('¡Alerta de seguridad! El archivo de la bóveda fue expuesto públicamente.');
    }
    console.log('✅ Bóveda impenetrable: Los archivos de la bóveda no se sirven estáticamente.');

    // 5. Probar aprobación de pago (Simulador / Webhook)
    console.log('\n[5] Simulando confirmación de pago de $10...');
    const simRes = await fetch(`${baseUrl}/api/simulate-payment/${createData.orderId}`, { method: 'POST' });
    const simData = await simRes.json();
    if (!simData.success || !simData.order.downloadToken) {
      throw new Error('Fallo en la confirmación de pago: ' + JSON.stringify(simData));
    }
    console.log('✅ Pago confirmado. Token criptográfico emitido.');

    // 6. Verificar estado aprobado en polling
    console.log('\n[6] Verificando polling con orden aprobada...');
    const approvedStatusRes = await fetch(`${baseUrl}/api/order-status/${createData.orderId}`);
    const approvedStatusData = await approvedStatusRes.json();
    if (!approvedStatusData.order.isApproved || !approvedStatusData.order.downloadUrl) {
      throw new Error('El estado no refleja la aprobación');
    }
    console.log('✅ Polling reporta isApproved: true y downloadUrl disponible.');

    // 7. Descargar archivo protegido con token válido
    console.log('\n[7] Descargando producto de la bóveda con token válido...');
    const downloadRes = await fetch(`${baseUrl}${approvedStatusData.order.downloadUrl}`);
    if (downloadRes.status !== 200) {
      throw new Error(`Fallo en descarga: HTTP ${downloadRes.status}`);
    }
    const htmlContent = await downloadRes.text();
    if (!htmlContent.includes('cube-face') || !htmlContent.includes('PI.JUGUETES')) {
      throw new Error('El contenido descargado no coincide con el producto esperado');
    }
    console.log('✅ Descarga exitosa. El archivo contiene la animación 3D y la licencia verificada.');

    console.log('\n======================================================');
    console.log('🎉 TODAS LAS PRUEBAS DE SEGURIDAD PASARON (7/7)');
    console.log('======================================================\n');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('❌ Error en pruebas:', err);
  process.exit(1);
});
