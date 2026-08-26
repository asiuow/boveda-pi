let currentOrderId = null;
let pollInterval = null;
let unlockedUrl = null;

const btnPay = document.getElementById('btnPay');
const statusPanel = document.getElementById('statusPanel');
const statusSpinner = document.getElementById('statusSpinner');
const statusText = document.getElementById('statusText');
const unlockedGroup = document.getElementById('unlockedGroup');
const btnOpenWeb = document.getElementById('btnOpenWeb');
const toast = document.getElementById('toast');

function showToast(msg) {
  toast.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

/**
 * Iniciar Pago con Mercado Pago
 */
async function handleStartPayment() {
  btnPay.disabled = true;
  btnPay.innerText = 'Conectando con Mercado Pago...';

  try {
    const res = await fetch('/api/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();

    if (!data.success) {
      alert('Error: ' + (data.error || 'No se pudo conectar'));
      btnPay.disabled = false;
      btnPay.innerText = 'Pagar $10 con Mercado Pago';
      return;
    }

    currentOrderId = data.orderId;
    statusPanel.style.display = 'block';
    statusPanel.className = 'status-panel';
    statusSpinner.style.display = 'block';
    statusText.innerText = 'Esperando confirmación del pago en Mercado Pago...';
    unlockedGroup.style.display = 'none';

    startPolling(currentOrderId);

    const checkoutUrl = data.initPoint || data.sandboxInitPoint;
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
    }

    btnPay.disabled = false;
    btnPay.innerText = 'Reabrir Mercado Pago';
  } catch (err) {
    alert('Error al conectar con el servidor.');
    btnPay.disabled = false;
    btnPay.innerText = 'Pagar $10 con Mercado Pago';
  }
}

/**
 * Polling para escuchar el pago en tiempo real
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
    } catch (e) {
      console.warn('Error en polling:', e);
    }
  }, 2500);
}

/**
 * Desbloqueo del enlace web al confirmarse el pago (Sin Descargas)
 */
function handlePaymentApproved(order) {
  statusSpinner.style.display = 'none';
  statusPanel.classList.add('status-success');
  statusText.innerText = '✅ ¡Pago aprobado! Enlace web generado:';

  unlockedUrl = window.location.origin + order.accessUrl;
  btnOpenWeb.href = order.accessUrl;
  unlockedGroup.style.display = 'flex';

  showToast('¡Acceso web desbloqueado!');
}

/**
 * Compartir en WhatsApp
 */
function handleShareWhatsApp() {
  const shareText = encodeURIComponent('Animación 2D Cuadrado Giratorio - pi.juguetes $10 ARS: ' + window.location.origin);
  window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
}

/**
 * Copiar enlace al portapapeles
 */
function handleCopyLink() {
  const url = window.location.origin;
  navigator.clipboard.writeText(url).then(() => {
    showToast('Enlace copiado al portapapeles');
  }).catch(() => {
    showToast('URL: ' + url);
  });
}

/**
 * Compartir el enlace web generado en WhatsApp
 */
function handleShareUnlockedLink() {
  if (!unlockedUrl) return;
  const shareText = encodeURIComponent('Aquí tienes el enlace web del Cuadrado 2D: ' + unlockedUrl);
  window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
}

/**
 * Simular Pago Aprobado (Modo Prueba Instantáneo)
 */
async function handleSimulateApproved() {
  try {
    statusPanel.style.display = 'block';
    statusSpinner.style.display = 'block';
    statusText.innerText = 'Simulando pago...';
    unlockedGroup.style.display = 'none';

    const resPref = await fetch('/api/create-preference', { method: 'POST' });
    const prefData = await resPref.json();

    const resSim = await fetch(`/api/simulate-payment/${prefData.orderId}`, { method: 'POST' });
    const simData = await resSim.json();

    if (simData.success) {
      handlePaymentApproved({ accessUrl: simData.order.accessUrl });
    }
  } catch (err) {
    alert('Error en simulación: ' + err.message);
  }
}
