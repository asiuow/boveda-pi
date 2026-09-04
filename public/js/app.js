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

// 10 Modelos disponibles
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
    color: '#ef4444'
  },
  'bautismo': {
    title: '2. Bautismo',
    h2: '¿Quién se bautiza? 🕊️',
    desc: 'Ingresa los datos para la bendición',
    labelName: 'Nombre del bautizado/a',
    labelAge: 'Detalle especial (opcional)',
    showAge: false,
    badgeDefault: 'Mi Bautismo 🕊️',
    headline: 'Te invito a compartir este momento tan especial y bendecido ✨',
    color: '#0ea5e9'
  },
  'asado': {
    title: '3. Asado',
    h2: '¿Quién invita al asado? 🥩',
    desc: 'Detalles del asador o motivo del asado',
    labelName: 'Nombre del asador / anfitrión',
    labelAge: 'Motivo del asado (opcional)',
    showAge: false,
    badgeDefault: '¡Gran Asado! 🥩🔥',
    headline: '¡Se prende el fuego! Te invito a compartir un gran asado 🍷',
    color: '#f97316'
  },
  'evento': {
    title: '4. Evento VIP',
    h2: '¿Nombre del evento o anfitrión? 🥂',
    desc: 'Celebraciones exclusivas, galas o aniversarios',
    labelName: 'Nombre del evento / anfitrión',
    labelAge: 'Detalle adicional (opcional)',
    showAge: false,
    badgeDefault: 'Evento Especial 🌟',
    headline: '¡Estás cordialmente invitado a celebrar con nosotros! 🥂',
    color: '#8b5cf6'
  },
  'casamiento': {
    title: '5. Casamiento',
    h2: '¿Quiénes se casan? 💍',
    desc: 'Nombres de los novios o de la pareja',
    labelName: 'Nombres de la pareja',
    labelAge: 'Frase o detalle especial (opcional)',
    showAge: false,
    badgeDefault: '¡Nos Casamos! 💍💐',
    headline: '¡El día más feliz de nuestras vidas! Acompáñanos a festejar 🥂',
    color: '#ec4899'
  },
  'graduacion': {
    title: '6. Graduación',
    h2: '¿Quién se gradúa? 🎓',
    desc: 'Ingresa los datos del egresado/a',
    labelName: 'Nombre del egresado/a',
    labelAge: 'Título o carrera (opcional)',
    showAge: false,
    badgeDefault: '¡Graduación! 🎓🎉',
    headline: '¡Objetivo cumplido! Ven a festejar mi graduación con todo 🎓✨',
    color: '#3b82f6'
  },
  'pizza': {
    title: '7. Pizza Party',
    h2: '¿Quién es el anfitrión? 🍕',
    desc: 'Noche de pizzas, bebidas y amigos',
    labelName: 'Nombre del anfitrión / homenajeado',
    labelAge: 'Edad o motivo (opcional)',
    showAge: true,
    badgeDefault: '¡Pizza Party! 🍕🍻',
    headline: '¡Pizzas calientes, buena música y amigos! No faltes 🍕✨',
    color: '#eab308'
  },
  'poolparty': {
    title: '8. Pool Party',
    h2: '¿Quién invita a la pileta? 🏖️',
    desc: 'Tarde de sol, pileta y diversión',
    labelName: 'Nombre del anfitrión',
    labelAge: 'Detalle o edad (opcional)',
    showAge: true,
    badgeDefault: '¡Pool Party! ☀️🏊‍♂️',
    headline: '¡Trae malla, toalla y ganas de festejar al sol! 🏖️💦',
    color: '#14b8a6'
  },
  'tematica': {
    title: '9. Noche de Fiesta',
    h2: '¿Nombre de la fiesta o anfitrión? 🎭',
    desc: 'Noche temática, disfraces o baile',
    labelName: 'Nombre del evento / anfitrión',
    labelAge: 'Temática o detalle (opcional)',
    showAge: false,
    badgeDefault: '¡Fiesta Temática! 🎭✨',
    headline: '¡Prepara tu mejor look y ven a divertirte con nosotros! 🪩',
    color: '#10b981'
  },
  'cervezada': {
    title: '10. Cervezada',
    h2: '¿Quién organiza la juntada? 🍻',
    desc: 'After office, bar y amigos',
    labelName: 'Nombre del organizador',
    labelAge: 'Lugar o motivo (opcional)',
    showAge: false,
    badgeDefault: '¡Cervezada & After! 🍻🥨',
    headline: '¡Cervezas bien frías y amigos para brindar juntos! 🍻',
    color: '#d97706'
  }
};

/**
 * ========================================================
 * CONTROLADOR ABANICO 3D DE 10 TARJETAS (DRAG & SWIPE FLUIDO)
 * ========================================================
 */
const deckModelKeys = [
  'cumpleanos', 'bautismo', 'asado', 'evento', 'casamiento',
  'graduacion', 'pizza', 'poolparty', 'tematica', 'cervezada'
];

let deckActiveIndex = 0;
let deckCurrentFraction = 0;
const totalDeckCards = 10;

function updateDeckCards(fraction = deckCurrentFraction) {
  const cards = document.querySelectorAll('.deck-card');
  if (!cards.length) return;

  cards.forEach((card, idx) => {
    const diff = idx - fraction;
    const absDiff = Math.abs(diff);

    // Separación horizontal amplia para que las cartas se vean hacia los costados
    const tx = diff * 58; 
    
    // Curvatura del abanico: arco suave hacia la base
    const ty = Math.pow(absDiff, 1.2) * 8.0;
    
    // Profundidad 3D
    const tz = 110 - absDiff * 20;
    
    // Rotación angular del abanico: izquierda negativo, derecha positivo
    const rotZ = diff * 6.6;
    
    // Escala suave para profundidad
    const scale = Math.max(0.76, 1 - absDiff * 0.05);
    
    // Z-Index: la carta central siempre está por encima de las adyacentes
    const zIndex = Math.max(1, Math.round(50 - absDiff * 3));
    
    // Opacidad alta para que las cartas se vean claras hacia los costados
    const opacity = Math.max(0.65, 1 - absDiff * 0.1);

    if (absDiff < 0.15) {
      card.style.borderColor = '#e12b5b';
      card.style.boxShadow = '0 18px 40px rgba(225, 43, 91, 0.45), 0 6px 14px rgba(0, 0, 0, 0.2)';
    } else {
      card.style.borderColor = 'rgba(225, 43, 91, 0.5)';
      card.style.boxShadow = '0 10px 24px rgba(0, 0, 0, 0.15)';
    }

    card.style.transform = `translate3d(${tx}px, ${ty}px, ${tz}px) rotate(${rotZ}deg) scale(${scale})`;
    card.style.zIndex = zIndex;
    card.style.opacity = opacity;
    card.style.visibility = opacity <= 0.05 ? 'hidden' : 'visible';
  });

  // Actualizar modelo seleccionado en el estado global
  const rounded = Math.round(Math.max(0, Math.min(totalDeckCards - 1, fraction)));
  const type = deckModelKeys[rounded] || 'cumpleanos';
  cardState.eventType = type;
  const config = eventModelConfig[type] || eventModelConfig['cumpleanos'];

  // Actualizar tag dinámico bajo el abanico
  const tagEl = document.getElementById('deckCurrentTag');
  if (tagEl) {
    const emojis = {
      'cumpleanos': '🎂', 'bautismo': '🕊️', 'asado': '🥩', 'evento': '🥂',
      'casamiento': '💍', 'graduacion': '🎓', 'pizza': '🍕', 'poolparty': '🏖️',
      'tematica': '🎭', 'cervezada': '🍻'
    };
    const emoji = emojis[type] || '🎴';
    const num = String(rounded + 1).padStart(2, '0');
    tagEl.innerText = `${emoji} Modelo ${num} / 10: ${config.title.replace(/^\d+\.\s*/, '')}`;
  }

  // Adaptar textos del Paso 1 para que coincidan con el modelo elegido
  const step1Title = document.getElementById('step1Title');
  if (step1Title) step1Title.innerText = config.h2;
  const step1Desc = document.getElementById('step1Desc');
  if (step1Desc) step1Desc.innerText = config.desc;
  const labelName = document.getElementById('labelName');
  if (labelName) labelName.innerText = config.labelName;
  const labelAge = document.getElementById('labelAge');
  if (labelAge) labelAge.innerText = config.labelAge;
  const groupAge = document.getElementById('groupAge');
  if (groupAge) groupAge.style.display = config.showAge ? 'block' : 'none';
}

function selectDeckCard(targetIndex) {
  const stage = document.getElementById('deckStage');
  if (stage && stage.dataset.hasMoved === 'true') {
    return; // Evita clic accidental durante arrastre
  }
  targetIndex = Math.max(0, Math.min(totalDeckCards - 1, targetIndex));
  deckActiveIndex = targetIndex;
  animateDeckTo(targetIndex);
}

function animateDeckTo(targetFraction, customDuration = 320) {
  const start = deckCurrentFraction;
  const change = targetFraction - start;
  let startTime = null;

  function stepAnimation(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min(1, (timestamp - startTime) / customDuration);
    // Easing elástico/suave
    const ease = 1 - Math.pow(1 - progress, 3);
    deckCurrentFraction = start + change * ease;
    updateDeckCards(deckCurrentFraction);

    if (progress < 1) {
      requestAnimationFrame(stepAnimation);
    } else {
      deckCurrentFraction = targetFraction;
      deckActiveIndex = Math.round(targetFraction);
      updateDeckCards(deckCurrentFraction);
    }
  }

  requestAnimationFrame(stepAnimation);
}

function initDeckStage() {
  const stage = document.getElementById('deckStage');
  if (!stage) return;

  const touchTarget = document.querySelector('.deck-stage-frame') || stage;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startFraction = 0;
  let dragMoved = false;
  let startTime = 0;
  let lastX = 0;
  let lastTime = 0;
  let velocityX = 0;

  function onPointerDown(e) {
    isDragging = true;
    dragMoved = false;
    stage.dataset.hasMoved = 'false';
    stage.classList.add('is-dragging');

    const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0].clientY) || 0;

    startX = clientX;
    startY = clientY;
    lastX = clientX;
    startTime = Date.now();
    lastTime = startTime;
    startFraction = deckCurrentFraction;
    velocityX = 0;

    const cards = document.querySelectorAll('.deck-card');
    cards.forEach(c => c.classList.add('no-transition'));

    const finger = document.getElementById('fingerTutorial');
    if (finger) {
      finger.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      finger.style.opacity = '0';
      finger.style.transform = 'translate(-50%, -50%) scale(0.3)';
      setTimeout(() => {
        if (finger && finger.parentNode) finger.remove();
      }, 220);
    }
  }

  function onPointerMove(e) {
    if (!isDragging) return;

    const currentX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0].clientX) || 0;
    const currentY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0].clientY) || 0;

    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    // Medir velocidad
    const now = Date.now();
    const dt = now - lastTime;
    if (dt > 10) {
      velocityX = (currentX - lastX) / dt;
      lastX = currentX;
      lastTime = now;
    }

    if (Math.abs(deltaX) > 5) {
      dragMoved = true;
      stage.dataset.hasMoved = 'true';
    }

    // Sensibilidad muy ágil y directa (85px = 1 carta)
    const fractionDelta = -deltaX / 85;
    let targetFraction = startFraction + fractionDelta;

    // Resistencia elástica en los límites (0 y 9)
    if (targetFraction < 0) {
      targetFraction = targetFraction * 0.2;
    } else if (targetFraction > totalDeckCards - 1) {
      const over = targetFraction - (totalDeckCards - 1);
      targetFraction = (totalDeckCards - 1) + over * 0.2;
    }

    deckCurrentFraction = targetFraction;
    updateDeckCards(deckCurrentFraction);
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    stage.classList.remove('is-dragging');

    const cards = document.querySelectorAll('.deck-card');
    cards.forEach(c => c.classList.remove('no-transition'));

    // Calcular inercia / impulso si el usuario lanzó el dedo rápido
    let targetSnap = Math.round(deckCurrentFraction);
    if (Math.abs(velocityX) > 0.4) {
      if (velocityX < -0.4) {
        // Deslizamiento rápido hacia la izquierda -> avanzar
        targetSnap = Math.ceil(deckCurrentFraction);
      } else if (velocityX > 0.4) {
        // Deslizamiento rápido hacia la derecha -> retroceder
        targetSnap = Math.floor(deckCurrentFraction);
      }
    }

    targetSnap = Math.max(0, Math.min(totalDeckCards - 1, targetSnap));
    animateDeckTo(targetSnap, 320);

    setTimeout(() => {
      stage.dataset.hasMoved = 'false';
    }, 80);
  }

  // Escuchar en todo el marco blanco del abanico
  touchTarget.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  // Touch en toda el área blanca del marco
  touchTarget.addEventListener('touchstart', onPointerDown, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
  window.addEventListener('touchend', onPointerUp);

  // Soporte de rueda de ratón o trackpad horizontal
  touchTarget.addEventListener('wheel', (e) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY * 0.5;
    if (Math.abs(delta) > 15) {
      const step = delta > 0 ? 1 : -1;
      const target = Math.max(0, Math.min(totalDeckCards - 1, Math.round(deckCurrentFraction) + step));
      animateDeckTo(target, 250);
      e.preventDefault();
    }
  }, { passive: false });

  // Auto-limpieza del dedo animado tutorial una vez finalizada la animación
  const fingerEl = document.getElementById('fingerTutorial');
  if (fingerEl) {
    fingerEl.addEventListener('animationend', () => {
      if (fingerEl && fingerEl.parentNode) fingerEl.remove();
    });
  }

  // Render inicial en tarjeta 0
  updateDeckCards(0);
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

// Inicializar el 3D Deck al cargar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDeckStage);
} else {
  initDeckStage();
}
