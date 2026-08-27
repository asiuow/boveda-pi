let currentStep = 0;
let currentOrderId = null;
let pollInterval = null;
let unlockedCardUrl = null;
let isAudioPlaying = false;

// Estado de la tarjeta
const cardState = {
  eventType: 'cumpleanos',
  name: '',
  age: '',
  photo: '',
  country: 'Argentina',
  province: '',
  city: '',
  address: '',
  date: '',
  time: ''
};

// Modelos disponibles
const eventModelConfig = {
  'cumpleanos': {
    title: '1. Cumpleaños',
    h2: '¿Quién cumple años? 🎂',
    desc: 'Ingresa los datos del cumpleañero/a',
    labelName: 'Nombre del cumpleañero/a',
    labelAge: '¿Cuántos años cumple?',
    showAge: true,
    badgeDefault: '¡Cumple {age} Años!',
    headline: '¡Te invito a celebrar mi cumpleaños juntos! 🎂🎈',
    shareText: 'Te invito a mi cumple 🎉',
    color: '#ef4444'
  },
  'bautismo': {
    title: '2. Bautismo',
    h2: '¿Quién se bautiza? 🕊️',
    desc: 'Ingresa los datos para la bendición',
    labelName: 'Nombre del bautizado/a',
    labelAge: 'Edad o fecha especial (opcional)',
    showAge: false,
    badgeDefault: 'Mi Bautismo 🕊️',
    headline: 'Te invito a compartir este momento tan especial y bendecido ✨',
    shareText: 'Te invito a mi bautismo 🕊️',
    color: '#0ea5e9'
  },
  'asado': {
    title: '3. Asado',
    h2: '¿Quién invita al asado? 🥩',
    desc: 'Detalles del anfitrión o motivo del asado',
    labelName: 'Nombre del asador / anfitrión',
    labelAge: 'Motivo del asado (opcional)',
    showAge: false,
    badgeDefault: '¡Gran Asado! 🥩🔥',
    headline: '¡Se prende el fuego! Te invito a compartir un gran asado 🍷',
    shareText: 'Te invito a un asado 🥩',
    color: '#f97316'
  },
  'evento': {
    title: '4. Evento Especial',
    h2: '¿Nombre del evento o anfitrión? 🥂',
    desc: 'Celebraciones, fiestas privadas o aniversarios',
    labelName: 'Nombre del evento / anfitrión',
    labelAge: 'Detalle adicional (opcional)',
    showAge: false,
    badgeDefault: 'Evento Especial 🌟',
    headline: '¡Estás cordialmente invitado a celebrar con nosotros! 🥂',
    shareText: 'Te invito a mi evento 🥂',
    color: '#8b5cf6'
  }
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
 * Pop-up Divertido Personalizado (Fondo Blanco, Esquinas Redondeadas, Gris Claro Bold)
 */
function showFunModal({ emoji = '🎉', title = '¡Un momentito!', text = '' }) {
  const emojiEl = document.getElementById('funModalEmoji');
  const titleEl = document.getElementById('funModalTitle');
  const textEl = document.getElementById('funModalText');
  const overlayEl = document.getElementById('funModalOverlay');
  if (emojiEl) emojiEl.innerText = emoji;
  if (titleEl) titleEl.innerText = title;
  if (textEl) textEl.innerText = text;
  if (overlayEl) overlayEl.classList.add('show');
}

function closeFunModal() {
  const overlayEl = document.getElementById('funModalOverlay');
  if (overlayEl) overlayEl.classList.remove('show');
}

function handleFunModalOverlayClick(event) {
  if (event.target.id === 'funModalOverlay') {
    closeFunModal();
  }
}

/**
 * Selección interactiva de carta en el Abanico de la Home
 */
function selectFanCard(type, el) {
  cardState.eventType = type;

  // Traer al frente la carta seleccionada
  document.querySelectorAll('.fan-card').forEach(card => {
    card.classList.remove('active-front');
  });
  el.classList.add('active-front');

  const config = eventModelConfig[type] || eventModelConfig['cumpleanos'];
  document.getElementById('selectedModelLabel').innerText = config.title;
  document.getElementById('selectedModelLabel').style.color = config.color;

  // Adaptar textos del Paso 1
  document.getElementById('step1Title').innerText = config.h2;
  document.getElementById('step1Desc').innerText = config.desc;
  document.getElementById('labelName').innerText = config.labelName;
  document.getElementById('labelAge').innerText = config.labelAge;
  document.getElementById('groupAge').style.display = config.showAge ? 'block' : 'none';
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
 * Cargar, comprimir y optimizar foto para móviles (Canvas max 800x800)
 */
function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const maxDim = 800;
      let width = img.width;
      let height = img.height;

      if (width > height && width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else if (height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      cardState.photo = compressedDataUrl;

      document.getElementById('imgPreview').src = cardState.photo;
      document.getElementById('imgPreview').style.display = 'block';
      document.getElementById('photoIcon').style.display = 'none';
      document.getElementById('uploaderText').innerText = 'Foto lista ✅';
      document.getElementById('sumPhotoStatus').innerText = 'Cargada y Optimizada ✅';
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

/**
 * Navegación entre pasos
 */
function goToStep(step) {
  // Validaciones paso 1
  if (step === 2 && currentStep === 1) {
    const name = document.getElementById('inputName').value.trim();
    if (!name) {
      showFunModal({
        emoji: '📝✨',
        title: '¡Falta el nombre!',
        text: 'Por favor, escribe el nombre del homenajeado o anfitrión para que todos sepan a quién celebramos.'
      });
      return;
    }
    cardState.name = name.slice(0, 20);
    cardState.age = document.getElementById('inputAge').value.trim();
  }

  // Validaciones paso 2 (Ubicación Geográfica Precisa)
  if (step === 3 && currentStep === 2) {
    const country = document.getElementById('inputCountry').value.trim() || 'Argentina';
    const province = document.getElementById('inputProvince').value.trim();
    const city = document.getElementById('inputCity').value.trim();
    const address = document.getElementById('inputAddress').value.trim();
    const date = document.getElementById('inputDate').value.trim();
    const time = document.getElementById('inputTime').value.trim();

    if (!address || !city || !province) {
      showFunModal({
        emoji: '🗺️📍',
        title: '¡Casi listos!',
        text: 'Por favor, completa Dirección, Ciudad y Provincia para que el mapa ubique con total exactitud el lugar de tu fiesta.'
      });
      return;
    }

    cardState.country = country;
    cardState.province = province;
    cardState.city = city;
    cardState.address = address;
    cardState.date = date || 'Sábado';
    cardState.time = time || '18:00 hs';

    // Rellenar resumen Panel 3
    const config = eventModelConfig[cardState.eventType] || eventModelConfig['cumpleanos'];
    document.getElementById('sumModel').innerText = config.title;
    document.getElementById('sumName').innerText = cardState.name;
    document.getElementById('sumAge').innerText = cardState.age ? cardState.age + ' años' : '-';
    document.getElementById('sumAddress').innerText = cardState.address;
    document.getElementById('sumCityProv').innerText = `${cardState.city}, ${cardState.province}`;
    document.getElementById('sumCountry').innerText = cardState.country;
    document.getElementById('sumDateTime').innerText = `${cardState.date} a las ${cardState.time}`;
  }

  if (currentStep === 4 && step < 4 && isAudioPlaying) {
    audioEl.pause();
    isAudioPlaying = false;
    btnPlayMusic.innerText = '▶️ Escuchar';
  }

  if (step < 4) {
    const initialBlock = document.getElementById('paymentInitialState');
    if (initialBlock) initialBlock.style.display = 'block';
    const approvedBlock = document.getElementById('paymentApprovedState');
    if (approvedBlock) approvedBlock.style.display = 'none';
    const statusBox = document.getElementById('cardStatusBox');
    if (statusBox) statusBox.style.display = 'none';
  }

  currentStep = step;

  // Actualizar visibilidad de paneles
  document.querySelectorAll('.panel').forEach((p, idx) => {
    p.classList.toggle('active', idx === step);
  });

  // Actualizar indicadores (dots 0 a 4)
  for (let i = 0; i <= 4; i++) {
    const dot = document.getElementById(`dot${i}`);
    if (dot) dot.classList.toggle('active', i === step);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Generar Previsualización de la Tarjeta
 */
function generateCardPreview() {
  goToStep(4);

  const config = eventModelConfig[cardState.eventType] || eventModelConfig['cumpleanos'];

  // Inyectar datos en la tarjeta
  document.getElementById('cardNameTitle').innerText = cardState.name;
  
  if (cardState.eventType === 'cumpleanos' && cardState.age) {
    document.getElementById('cardAgeBadge').innerText = `¡Cumple ${cardState.age} Años!`;
  } else {
    document.getElementById('cardAgeBadge').innerText = config.badgeDefault;
  }
  document.getElementById('cardHeadlineText').innerText = config.headline;

  document.getElementById('cardDateText').innerText = cardState.date;
  document.getElementById('cardTimeText').innerText = cardState.time;
  document.getElementById('cardAddressText').innerText = cardState.address;
  document.getElementById('cardCityText').innerText = `${cardState.city}, ${cardState.province} (${cardState.country})`;

  // Foto
  const heroPhoto = document.getElementById('cardHeroPhoto');
  if (cardState.photo) {
    heroPhoto.src = cardState.photo;
  } else {
    heroPhoto.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23ef4444"/><text x="50" y="65" font-size="40" text-anchor="middle" fill="white">🎉</text></svg>';
  }

  // Enlace a Google Maps con ubicación geográfica exacta
  const exactLocationQuery = encodeURIComponent(`${cardState.address}, ${cardState.city}, ${cardState.province}, ${cardState.country}`);
  document.getElementById('cardGmapsLink').href = `https://www.google.com/maps/search/?api=1&query=${exactLocationQuery}`;

  // Geocodificar en OpenStreetMap (escala de 3 manzanas, delta 0.0025)
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${exactLocationQuery}`)
    .then(res => res.json())
    .then(data => {
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const delta = 0.0025; // 3 manzanas (~250-300m)
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
 * Iniciar compra con Mercado Pago ($10 ARS)
 */
async function handlePayCard() {
  const btn = document.getElementById('btnPayCard');
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = '0.7';
  }

  try {
    const res = await fetch('/api/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardData: cardState })
    });
    const data = await res.json();

    if (!data.success) {
      showFunModal({
        emoji: '💳⚡',
        title: '¡Un momento!',
        text: data.error || 'No se pudo generar el pago en este momento. Por favor intenta de nuevo.'
      });
      if (btn) {
        btn.disabled = false;
        btn.style.opacity = '1';
      }
      return;
    }

    currentOrderId = data.orderId;
    const statusBox = document.getElementById('cardStatusBox');
    if (statusBox) {
      statusBox.style.display = 'block';
      statusBox.className = 'status-box';
      const spinner = document.getElementById('statusSpinner');
      if (spinner) spinner.style.display = 'block';
      const msg = document.getElementById('statusMsg');
      if (msg) msg.innerText = 'Esperando confirmación en Mercado Pago...';
    }

    startCardPolling(currentOrderId);

    const checkoutUrl = data.initPoint || data.sandboxInitPoint;
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
    }

    if (btn) {
      btn.disabled = false;
      btn.style.opacity = '1';
    }
  } catch (err) {
    showFunModal({
      emoji: '📡⚠️',
      title: 'Conexión interrumpida',
      text: 'No pudimos comunicarnos con el servidor. Revisa tu conexión e inténtalo nuevamente.'
    });
    if (btn) {
      btn.disabled = false;
      btn.style.opacity = '1';
    }
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
  unlockedCardUrl = window.location.origin + order.accessUrl;

  // Ocultar bloque inicial de pago (Mercado Pago, precio y simulación)
  const initialBlock = document.getElementById('paymentInitialState');
  if (initialBlock) initialBlock.style.display = 'none';

  // Mostrar ÚNICAMENTE el botón de compartir por WhatsApp
  const approvedBlock = document.getElementById('paymentApprovedState');
  if (approvedBlock) approvedBlock.style.display = 'flex';

  showToast('¡Pago aprobado! Ya puedes compartir por WhatsApp');
}

function handleShareWhatsApp() {
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(window.location.origin)}`, '_blank');
}

function handleShareFinalInvitation() {
  if (!unlockedCardUrl) return;
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(unlockedCardUrl)}`, '_blank');
}

async function handleSimulateCardPayment() {
  try {
    const statusBox = document.getElementById('cardStatusBox');
    if (statusBox) {
      statusBox.style.display = 'block';
      const spinner = document.getElementById('statusSpinner');
      if (spinner) spinner.style.display = 'block';
      const msg = document.getElementById('statusMsg');
      if (msg) msg.innerText = 'Simulando pago de $10...';
    }

    const resPref = await fetch('/api/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardData: cardState })
    });
    const prefData = await resPref.json();

    if (!prefData.success || !prefData.orderId) {
      throw new Error(prefData.error || 'Error al inicializar la orden');
    }

    const resSim = await fetch(`/api/simulate-payment/${prefData.orderId}`, { method: 'POST' });
    const simData = await resSim.json();

    if (simData.success && simData.order) {
      handleCardApproved({ accessUrl: simData.order.accessUrl });
    } else {
      throw new Error(simData.error || 'Error en la simulación');
    }
  } catch (err) {
    showFunModal({
      emoji: '⚡⚠️',
      title: 'Aviso de prueba',
      text: err.message || 'Ocurrió un detalle en la simulación.'
    });
  }
}
