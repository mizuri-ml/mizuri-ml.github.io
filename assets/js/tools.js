'use strict';
(() => {
  const el = id => document.getElementById(id);
  const showError = (id, text) => { const element = el(id); if (!element) return; element.textContent = text; element.hidden = !text; };
  const numToIp = value => [24, 16, 8, 0].map(shift => (value >>> shift) & 255).join('.');
  const parseIPv4 = input => {
    const raw = input.trim();
    if (!/^(?:\d{1,3}\.){3}\d{1,3}$/.test(raw)) throw new Error('Introduce una dirección IPv4 válida, por ejemplo 192.168.10.42.');
    const octets = raw.split('.').map(Number);
    if (octets.some(n => n > 255)) throw new Error('Cada octeto debe tener un valor entre 0 y 255.');
    return ((octets[0] * 16777216) + (octets[1] * 65536) + (octets[2] * 256) + octets[3]) >>> 0;
  };
  const displayResult = (label, value) => {
    const box = document.createElement('div');
    box.className = 'result-cell';
    const head = document.createElement('span'); head.textContent = label;
    const body = document.createElement('strong'); body.textContent = value;
    box.append(head, body);
    return box;
  };
  const subnet = el('subnet-form');
  if (subnet) subnet.addEventListener('submit', event => {
    event.preventDefault();
    try {
      const ip = parseIPv4(el('ipv4').value);
      const prefixText = el('prefix').value.trim();
      const prefix = Number(prefixText);
      if (!/^\d+$/.test(prefixText) || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) throw new Error('El prefijo CIDR debe ser un número entero entre 0 y 32.');
      const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
      const network = (ip & mask) >>> 0;
      const broadcast = (network | (~mask >>> 0)) >>> 0;
      const total = 2 ** (32 - prefix);
      const usable = prefix === 32 ? 1 : prefix === 31 ? 2 : total - 2;
      const first = prefix >= 31 ? network : network + 1;
      const last = prefix >= 31 ? broadcast : broadcast - 1;
      const output = el('subnet-output');
      output.replaceChildren(
        displayResult('Dirección de red', `${numToIp(network)}/${prefix}`),
        displayResult('Máscara', numToIp(mask)),
        displayResult('Broadcast', numToIp(broadcast)),
        displayResult('Primer host', numToIp(first)),
        displayResult('Último host', numToIp(last)),
        displayResult('Hosts utilizables', usable.toLocaleString('es-EC'))
      );
      output.hidden = false;
      showError('subnet-error', '');
    } catch (error) {
      el('subnet-output').hidden = true;
      showError('subnet-error', error.message);
    }
  });

  const pwSlider = el('password-length');
  if (pwSlider) pwSlider.addEventListener('input', () => { el('length-label').textContent = pwSlider.value; });
  const sets = [
    ['pw-uppercase', 'ABCDEFGHJKLMNPQRSTUVWXYZ'],
    ['pw-lowercase', 'abcdefghijkmnopqrstuvwxyz'],
    ['pw-numbers', '23456789'],
    ['pw-symbols', '!@#$%^&*-_=+?']
  ];
  const secureInt = max => {
    if (!globalThis.crypto || typeof crypto.getRandomValues !== 'function') throw new Error('Se requiere un navegador con Web Crypto disponible.');
    const limit = Math.floor(4294967296 / max) * max;
    const bytes = new Uint32Array(1);
    let number;
    do { crypto.getRandomValues(bytes); number = bytes[0]; } while (number >= limit);
    return number % max;
  };
  const pwForm = el('password-form');
  if (pwForm) pwForm.addEventListener('submit', event => {
    event.preventDefault();
    try {
      const chosen = sets.filter(([id]) => el(id).checked).map(([,chars]) => chars);
      if (!chosen.length) throw new Error('Selecciona al menos un grupo de caracteres.');
      const size = Number(el('password-length').value);
      const all = chosen.join('');
      const chars = chosen.map(set => set[secureInt(set.length)]);
      while (chars.length < size) chars.push(all[secureInt(all.length)]);
      for (let i = chars.length - 1; i > 0; i--) { const j = secureInt(i + 1); [chars[i], chars[j]] = [chars[j], chars[i]]; }
      el('generated-password').value = chars.join('');
      el('password-output').hidden = false;
      el('password-message').textContent = 'Generada localmente mediante Web Crypto; no se almacena ni se envía.';
      showError('password-error', '');
    } catch (error) { showError('password-error', error.message); }
  });
  const copyText = async (inputId, messageId) => {
    try { await navigator.clipboard.writeText(el(inputId).value); el(messageId).textContent = 'Copiado al portapapeles.'; }
    catch (_) { el(messageId).textContent = 'No se pudo copiar automáticamente. Selecciona el texto manualmente.'; }
  };
  if (el('copy-password')) el('copy-password').addEventListener('click', () => copyText('generated-password', 'password-message'));

  const hashForm = el('hash-form');
  if (hashForm) hashForm.addEventListener('submit', async event => {
    event.preventDefault();
    try {
      if (!crypto.subtle) throw new Error('Tu navegador necesita un contexto seguro HTTPS para calcular SHA-256.');
      const input = el('hash-input').value;
      if (!input) throw new Error('Introduce un texto para calcular el hash.');
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
      el('hash-result').value = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
      el('hash-output').hidden = false;
      el('hash-message').textContent = 'SHA-256 calculado localmente. El texto no sale del navegador.';
      showError('hash-error', '');
    } catch (error) { showError('hash-error', error.message); }
  });
  if (el('copy-hash')) el('copy-hash').addEventListener('click', () => copyText('hash-result', 'hash-message'));
})();
