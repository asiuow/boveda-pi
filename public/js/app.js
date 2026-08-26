let currentStep = 1;
let currentOrderId = null;
let pollInterval = null;
let unlockedCardUrl = null;
let isAudioPlaying = false;

// Estado de la tarjeta
const cardState = {
  name: '',
  age: '',
  photo: '',
  address: '',
  city: '',
  date: '',
  time: ''
};

// Elementos DOM
const audioEl = document.getElementById('previewAudio');
const btnPlayMusic = document.getElementById('btnPlayMusic');
const toastEl = document.getElementById('toast');

function showToast(msg) {
  toastEl.innerText = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 2500);
}

/**
 * Contador de caracteres del nombre (Máx 20 letras)
 */
function updateCharCount() {
  const input = document.getElementById('inputName');
  const count = input.value.length;
  document.getElementById('charCount').innerText = `${count} / 20`;
}

/**
 * Cargar y previsualizar foto en Base64
 */
function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    cardState.photo = e.target.result;
    document.getElementById('imgPreview').src = cardState.photo;
    document.getElementById('imgPreview').style.display = 'block';
    document.getElementById('photoIcon').style.display = 'none';
    document.getElementById('uploaderText').innerText = 'Foto seleccionada ✅';
    document.getElementById('sumPhotoStatus').innerText = 'Cargada ✅';
  };
  reader.readAsDataURL(file);
}

/**
 * Navegación entre pasos del Asistente
 */
function goToStep(step) {
  // Validaciones
  if (step === 2 && currentStep === 1) {
    const name = document.getElementById('inputName').value.trim();
    const age = document.getElementById('inputAge').value.trim();
    if (!name) {
      alert('Por favor, ingresa el nombre del cumpleañero/a (máx. 20 letras).');
      return;
    }
    if (!age) {
      alert('Por favor, ingresa los años que cumple.');
      return;
    }
    cardState.name = name.slice(0, 20);
    cardState.age = age;
  }

  if (step === 3 && currentStep === 2) {
    const address = document.getElementById('inputAddress').value.trim();
    const city = document.getElementById('inputCity').value.trim();
    const date = document.getElementById('inputDate').value.trim();
    const time = document.getElementById('inputTime').value.trim();

    if (!address || !city) {
      alert('Por favor, completa la dirección y la ciudad.');
      return;
    }
    cardState.address = address;
    cardState.city = city;
    cardState.date = date || 'Sábado';
    cardState.time = time || '18:00 hs';

    // Rellenar resumen del Panel 3
    document.getElementById('sumName').innerText = cardState.name;
    document.getElementById('sumAge').innerText = cardState.age + ' años';
    document.getElementById('sumAddress').innerText = cardState.address;
    document.getElementById('sumCity').innerText = cardState.city;
    document.getElementById('sumDate').innerText = cardState.date;
    document.getElementById('sumTime').innerText = cardState.time;
  }

  // Detener música si se retrocede desde el paso 4
  if (currentStep === 4 && step < 4 && isAudioPlaying) {
    audioEl.pause();
    isAudioPlaying = false;
    btnPlayMusic.innerText = '▶️ Escuchar';
  }

  currentStep = step;

  // Actualizar paneles visibles
  document.querySelectorAll('.panel').forEach((p, idx) => {
    p.classList.toggle('active', idx + 1 === step);
  });

  // Actualizar indicadores (dots)
  for (let i = 1; i <= 4; i++) {
    const dot = document.getElementById(`dot${i}`);
    if (dot) dot.classList.toggle('active', i === step);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Generar la Tarjeta Final y Enfocar Mapa
 */
function generateCardPreview() {
  goToStep(4);

  // Inyectar datos en la tarjeta
  document.getElementById('cardNameTitle').innerText = cardState.name;
  document.getElementById('cardAgeBadge').innerText = `¡Cumple ${cardState.age} Años!`;
  document.getElementById('cardDateText').innerText = cardState.date;
  document.getElementById('cardTimeText').innerText = cardState.time;
  document.getElementById('cardAddressText').innerText = cardState.address;
  document.getElementById('cardCityText').innerText = cardState.city;

  // Foto
  const heroPhoto = document.getElementById('cardHeroPhoto');
  if (cardState.photo) {
    heroPhoto.src = cardState.photo;
  } else {
    heroPhoto.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23ef4444"/><text x="50" y="65" font-size="40" text-anchor="middle" fill="white">🎉</text></svg>';
  }

  // Enlace a Google Maps
  const gmapsQuery = encodeURIComponent(`${cardState.address}, ${cardState.city}`);
  document.getElementById('cardGmapsLink').href = `https://www.google.com/maps/search/?api=1&query=${gmapsQuery}`;

  // Geocodificar en OpenStreetMap para escala de 3 manzanas (~300 metros, delta 0.0025)
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${gmapsQuery}`)
    .then(res => res.json())
    .then(data => {
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const delta = 0.0025; // 3 manzanas de escala
        const bbox = `${lon - delta}%2C${lat - delta}%2C${lon + delta}%2C${lat + delta}`;
        document.getElementById('cardMapFrame').src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
      }
    })
    .catch(() => {});
}

/**
 * Control del reproductor de música
 */
function toggleAudio() {
  if (isAudioPlaying) {
    audioEl.pause();
    isAudioPlaying = false;
    btnPlayMusic.innerText = '▶️ Escuchar';
  } else {
    audioEl.play().then(() => {
      isAudioPlaying = true;
      btnPlayMusic.innerText = '⏸️ Pausar';
    }).catch(() => {
      btnPlayMusic.innerText = '▶️ Escuchar';
    });
  }
}

/**
 * Iniciar compra con Mercado Pago por $10 ARS
 */
async function handlePayCard() {
  const btn = document.getElementById('btnPayCard');
  btn.disabled = true;
  btn.innerText = 'Conectando con Mercado Pago...';

  try {
    const res = await fetch('/api/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardData: cardState })
    });
    const data = await res.json();

    if (!data.success) {
      alert('Error: ' + (data.error || 'No se pudo generar el pago'));
      btn.disabled = false;
      btn.innerText = '💳 Comprar tarjeta por 10 pesos';
      return;
    }

    currentOrderId = data.orderId;
    const statusBox = document.getElementById('cardStatusBox');
    statusBox.style.display = 'block';
    statusBox.className = 'status-box';
    document.getElementById('statusSpinner').style.display = 'block';
    document.getElementById('statusMsg').innerText = 'Esperando confirmación en Mercado Pago...';
    document.getElementById('unlockedActions').style.display = 'none';

    startCardPolling(currentOrderId);

    const checkoutUrl = data.initPoint || data.sandboxInitPoint;
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
    }

    btn.disabled = false;
    btn.innerText = 'Reabrir Mercado Pago';
  } catch (err) {
    alert('Error de conexión con el servidor.');
    btn.disabled = false;
    btn.innerText = '💳 Comprar tarjeta por 10 pesos';
  }
}

function startCardPolling(orderId) {
  if (pollInterval) clearInterval(pollInterval);

  pollInterval = setInterval(async () => {
    try {
      const res = await fetch(`/api/order-status/${orderId}`);
      const data = await res.json();

      if (data.success && data.order && data.order.isApproved) {
        clearInterval(pollInterval);
        handleCardApproved(data.order);
      }
    } catch (e) {
      console.warn('Error en polling:', e);
    }
  }, 2500);
}

function handleCardApproved(order) {
  document.getElementById('statusSpinner').style.display = 'none';
  const statusBox = document.getElementById('cardStatusBox');
  statusBox.classList.add('status-success');
  document.getElementById('statusMsg').innerText = '🎉 ¡Pago acreditado! Tu tarjeta oficial está lista:';

  unlockedCardUrl = window.location.origin + order.accessUrl;
  document.getElementById('btnOpenFinalCard').href = order.accessUrl;
  document.getElementById('unlockedActions').style.display = 'flex';

  showToast('¡Tarjeta activada con éxito!');
}

/**
 * Compartir en WhatsApp
 */
function handleShareWhatsApp() {
  const text = encodeURIComponent(`¡Mira la tarjeta de cumpleaños de ${cardState.name || 'mi fiesta'}! 🎉\n${window.location.origin}`);
  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
}

/**
 * Enviar invitación final oficial por WhatsApp
 */
function handleShareFinalInvitation() {
  if (!unlockedCardUrl) return;
  const text = encodeURIComponent(`🎂 ¡Estás invitado al cumpleaños de ${cardState.name} (${cardState.age} años)!\n📅 Día: ${cardState.date} a las ${cardState.time}\n📍 Lugar: ${cardState.address}, ${cardState.city}\n\n🌟 Toca el enlace para ver la tarjeta interactiva con música y mapa:\n${unlockedCardUrl}`);
  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
}

/**
 * Simulación de Pago Aprobado
 */
async function handleSimulateCardPayment() {
  try {
    const statusBox = document.getElementById('cardStatusBox');
    statusBox.style.display = 'block';
    document.getElementById('statusSpinner').style.display = 'block';
    document.getElementById('statusMsg').innerText = 'Simulando pago de $10...';
    document.getElementById('unlockedActions').style.display = 'none';

    const resPref = await fetch('/api/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardData: cardState })
    });
    const prefData = await resPref.json();

    const resSim = await fetch(`/api/simulate-payment/${prefData.orderId}`, { method: 'POST' });
    const simData = await resSim.json();

    if (simData.success) {
      handleCardApproved({ accessUrl: simData.order.accessUrl });
    }
  } catch (err) {
    alert('Error en simulación: ' + err.message);
  }
}
