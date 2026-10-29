const POLL_MS = 60_000;
let lastSignature = null;

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/gu, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[char]);

function safeHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

function embedUrl(value) {
  const href = safeHttpUrl(value);
  if (!href) return null;
  const url = new URL(href);
  const host = url.hostname.replace(/^(www|m)\./u, '');
  if (host === 'facebook.com' || host === 'fb.watch') {
    const embed = new URL('https://www.facebook.com/plugins/video.php');
    embed.searchParams.set('href', href);
    embed.searchParams.set('show_text', 'false');
    embed.searchParams.set('width', '560');
    return embed.href;
  }
  if (host === 'youtube.com' || host === 'youtu.be') {
    let id = url.searchParams.get('v');
    if (!id && host === 'youtu.be') id = url.pathname.slice(1);
    if (!id) id = url.pathname.match(/\/(?:embed|live|shorts)\/([\w-]+)/u)?.[1];
    if (id && /^[\w-]+$/u.test(id)) return `https://www.youtube.com/embed/${id}`;
  }
  return null;
}

function dateLabelOf(stream) {
  const parsed = Date.parse(stream.date || '');
  if (Number.isFinite(parsed)) {
    return new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(parsed));
  }
  return stream.dateLabel || '';
}

const timeOf = (stream) => {
  const parsed = Date.parse(stream.date || stream.createdAt || '');
  return Number.isFinite(parsed) ? parsed : 0;
};

async function fetchJson(path) {
  const response = await fetch(new URL(path, document.baseURI), { cache: 'no-store', headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Invalid data');
  return data;
}

async function loadStreams() {
  try {
    return await fetchJson('api/streams');
  } catch {
    return fetchJson('data/streams.json');
  }
}

function render(streams) {
  const player = document.getElementById('worship-player');
  const badge = document.getElementById('worship-live-badge');
  const feature = document.getElementById('worship-feature');
  const archive = document.getElementById('worship-archive-grid');
  const emptyArchive = document.getElementById('worship-archive-empty');
  if (!player || !badge || !feature || !archive) return;

  const valid = streams.filter((stream) => stream && embedUrl(stream.videoUrl));
  if (!valid.length) return;

  const sorted = [...valid].sort((a, b) => timeOf(b) - timeOf(a));
  const current = sorted.find((stream) => stream.isLive) || sorted.find((stream) => stream.isPrimary) || sorted[0];
  const rest = sorted.filter((stream) => stream !== current);
  const isLive = Boolean(current.isLive);
  const href = safeHttpUrl(current.videoUrl);
  const label = dateLabelOf(current);

  player.dataset.source = 'admin';
  player.dataset.live = String(isLive);
  player.dataset.videoUrl = href;
  player.dataset.createdAt = current.createdAt || current.date || '';
  const frame = player.querySelector('iframe');
  if (frame) {
    const src = embedUrl(current.videoUrl);
    if (frame.getAttribute('src') !== src) frame.src = src;
    frame.title = current.title || 'Трансляція богослужіння';
  }
  feature.hidden = false;

  badge.classList.toggle('is-live', isLive);
  badge.dataset.live = String(isLive);
  const liveLabel = badge.querySelector('.worship-live-label');
  if (liveLabel) liveLabel.textContent = isLive ? 'LIVE' : 'Останній запис';
  badge.setAttribute('aria-label', isLive ? 'Зараз триває прямий ефір' : 'Показано останній збережений запис');

  const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  setText('worship-feature-date', `${isLive ? 'ПРЯМИЙ ЕФІР' : 'ОСТАННІЙ ЕФІР'}${label ? ` · ${label.toUpperCase()}` : ''}`);
  setText('worship-feature-title', current.title || 'Богослужіння у Петропавлівському храмі');
  setText('worship-feature-description', current.description || '');
  for (const id of ['worship-feature-link', 'worship-feature-record-link']) {
    const link = document.getElementById(id);
    if (link) link.href = href;
  }
  const mainLink = document.getElementById('worship-feature-link');
  if (mainLink) mainLink.textContent = isLive ? 'Дивитися наживо ↗' : 'Дивитися ↗';

  archive.dataset.source = 'admin';
  archive.innerHTML = rest.slice(0, 9).map((stream) => {
    const streamHref = safeHttpUrl(stream.videoUrl);
    const streamLabel = dateLabelOf(stream);
    return `<article class="worship-archive-card" data-source="admin">
      <div class="worship-archive-player"><iframe title="${escapeHtml(stream.title || 'Запис богослужіння')}" loading="lazy" src="${escapeHtml(embedUrl(stream.videoUrl))}" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowfullscreen></iframe></div>
      <div class="worship-archive-copy"><p class="worship-meta">${escapeHtml(stream.isLive ? 'LIVE' : streamLabel.toUpperCase())}</p><h4>${escapeHtml(stream.title || 'Запис богослужіння')}</h4>${stream.description ? `<p class="mt-1 text-sm text-[#5d554a]">${escapeHtml(stream.description)}</p>` : ''}<a href="${escapeHtml(streamHref)}" target="_blank" rel="noopener noreferrer">Дивитися ↗</a></div>
    </article>`;
  }).join('');
  if (emptyArchive) emptyArchive.hidden = true;
}

async function refresh() {
  try {
    const streams = await loadStreams();
    const signature = JSON.stringify(streams);
    if (signature === lastSignature) return;
    lastSignature = signature;
    render(streams);
  } catch {
    // Немає збережених ефірів — залишаємо вміст сторінки без змін.
  }
}

refresh();
window.setInterval(refresh, POLL_MS);
