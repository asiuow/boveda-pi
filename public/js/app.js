let currentOrderId = null;
let pollInterval = null;

// Elementos DOM
const btnPay = document.getElementById('btnPay');
const paymentStatusBox = document.getElementById('paymentStatusBox');
const statusSpinner = document.getElementById('statusSpinner');
const statusTitle = document.getElementById('statusTitle');
const statusDesc = document.getElementById('statusDesc');
const downloadActionGroup = document.getElementById('downloadActionGroup');
const btnDownloadNow = document.getElementById('btnDownloadNow');
const btnViewNow = document.getElementById('btnViewNow');
const toast = document.getElementById('toast');

/**
 * Muestra mensaje Toast
 */
function showToast(message) {
  toast.innerText = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

/**
 * Inicia el proceso de pago con Mercado Pago
 */
async function handleStartPayment() {
  btnPay.disabled = true;
  btnPay.style.opacity = '0.7';
  btnPay.innerHTML = 'Conectando con Mercado Pago...';

  try {
    const response = await fetch('/api/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    if (!data.success) {
      alert('Error iniciando el pago: ' + (data.error || 'Intente nuevamente'));
      resetPayButton();
      return;
    }

    currentOrderId = data.orderId;
    localStorage.setItem('last_order_id', currentOrderId);

    // Mostrar panel de estado en vivo
    paymentStatusBox.style.display = 'block';
    paymentStatusBox.className = 'payment-status-box';
    statusSpinner.style.display = 'block';
    statusTitle.innerText = 'Esperando confirmación del pago...';
    statusDesc.innerText = 'Completa el pago en Mercado Pago. Al acreditarse, se descargará automáticamente.';
    downloadActionGroup.style.display = 'none';

    // Iniciar escucha del estado en tiempo real
    startPolling(currentOrderId);

    // Abrir pasarela de pago
    const checkoutUrl = data.initPoint || data.sandboxInitPoint;
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
    }

    resetPayButton('Reabrir Pasarela de Mercado Pago');
  } catch (error) {
    console.error('Error:', error);
    alert('No se pudo conectar con el servidor.');
    resetPayButton();
  }
}

/**
 * Restaura el estado del botón de pago
 */
function resetPayButton(text = 'Pagar $10 con Mercado Pago') {
  btnPay.disabled = false;
  btnPay.style.opacity = '1';
  btnPay.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
    ${text}
  `;
}

/**
 * Monitorea el estado de la orden cada 2.5 segundos
 */
function startPolling(orderId) {
  if (pollInterval) clearInterval(pollInterval);

  pollInterval = setInterval(async () => {
    try {
      const res = await fetch(`/api/order-status/${orderId}`);
      const data = await res.json();

      if (data.success && data.order && data.order.isApproved) {
        clearInterval(pollInterval);
        handlePaymentApproved(data.order);
      }
    } catch (err) {
      console.warn('Error consultando estado de orden:', err);
    }
  }, 2500);
}

/**
 * Ejecuta el desbloqueo y la descarga automática al confirmarse el pago
 */
function handlePaymentApproved(order) {
  statusSpinner.style.display = 'none';
  paymentStatusBox.classList.add('status-success');
  statusTitle.innerText = '✅ ¡Pago Acreditado con Éxito!';
  statusDesc.innerText = 'Token de la bóveda generado. Iniciando descarga automática...';

  // Configurar botones de descarga y visualización
  btnDownloadNow.href = order.downloadUrl;
  btnViewNow.href = order.viewUrl;
  downloadActionGroup.style.display = 'flex';

  // Disparar descarga automática en el navegador
  const autoDownloadLink = document.createElement('a');
  autoDownloadLink.href = order.downloadUrl;
  autoDownloadLink.setAttribute('download', 'animacion-cuadrado-rojo.html');
  document.body.appendChild(autoDownloadLink);
  autoDownloadLink.click();
  document.body.removeChild(autoDownloadLink);

  showToast('¡Descarga iniciada exitosamente!');
}

/**
 * Compartir enlace de la aplicación (Móvil y Escritorio)
 */
async function handleShareLink() {
  const shareData = {
    title: 'Animación 3D Cuadrado Rojo - pi.juguetes',
    text: 'Mira este producto digital interactivo. Pago seguro con Mercado Pago por $10 ARS.',
    url: window.location.origin
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      // Usuario canceló compartir o fallback
      copyToClipboard(window.location.origin);
    }
  } else {
    copyToClipboard(window.location.origin);
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('¡Enlace copiado al portapapeles!');
  }).catch(() => {
    showToast('Enlace: ' + text);
  });
}

/**
 * Simula el flujo completo de pago en 1 segundo (Modo Demo)
 */
async function handleSimulateInstantPayment() {
  try {
    paymentStatusBox.style.display = 'block';
    statusSpinner.style.display = 'block';
    statusTitle.innerText = 'Simulando pago de $10...';
    statusDesc.innerText = 'Creando orden y validando webhook...';

    // 1. Crear orden
    const resPref = await fetch('/api/create-preference', { method: 'POST' });
    const prefData = await resPref.json();
    const orderId = prefData.orderId;

    // 2. Simular aprobación
    const resSim = await fetch(`/api/simulate-payment/${orderId}`, { method: 'POST' });
    const simData = await resSim.json();

    if (simData.success) {
      handlePaymentApproved({
        downloadUrl: simData.order.downloadUrl,
        viewUrl: simData.order.viewUrl
      });
    }
  } catch (error) {
    alert('Error en simulación: ' + error.message);
  }
}

// Auto-detección si el usuario vuelve de Mercado Pago con ?order_id=...
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('order_id') || urlParams.get('simulated_order') || localStorage.getItem('last_order_id');

  if (orderId) {
    currentOrderId = orderId;
    paymentStatusBox.style.display = 'block';
    statusSpinner.style.display = 'block';
    statusTitle.innerText = 'Verificando estado de tu pago...';
    startPolling(orderId);
  }
});
