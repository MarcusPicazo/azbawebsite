const WHATSAPP_NUMBER = '525624230088'; // 52 (MX) + 56 24230088

export function whatsappLink(message) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

export function initQuoteForm() {
  const form = document.querySelector('#quote-form');
  if (!form) return;
  const success = form.querySelector('.quote-form__success');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get('name') || '').toString().trim();
    const date = (data.get('date') || '').toString().trim();
    const guests = (data.get('guests') || '').toString().trim();
    const items = (data.get('items') || '').toString().trim();

    const lines = [
      `Hola AZBA, soy ${name || '(nombre)'}.`,
      'Quisiera cotizar equipo para un evento:',
      date ? `Fecha: ${date}` : null,
      guests ? `Invitados aprox.: ${guests}` : null,
      items ? `Necesito: ${items}` : null,
    ].filter(Boolean);

    const url = whatsappLink(lines.join('\n'));
    window.open(url, '_blank', 'noopener');

    if (success) {
      success.classList.add('is-visible');
      success.textContent = 'Abriendo WhatsApp con tu solicitud lista para enviar…';
    }
  });
}

export function initWhatsappLinks() {
  document.querySelectorAll('[data-whatsapp]').forEach((el) => {
    const msg = el.getAttribute('data-whatsapp') || 'Hola AZBA, me gustaría cotizar equipo para un evento.';
    el.href = whatsappLink(msg);
    el.target = '_blank';
    el.rel = 'noopener';
  });
}
