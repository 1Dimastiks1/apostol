const API_URL = `${String(import.meta.env.BASE_URL || '/').replace(/\/+$/, '')}/api/facebook-content`;
const FALLBACK_RETENTION_DAYS = 14;
const FALLBACK_POLL_MS = 60_000;
let lastScheduleSignature = null;
let lastPostsSignature = null;
let lastVideosSignature = null;

const safeFacebookUrl = (value) => {
  try {
    const url = new URL(value);
    const allowed = ['facebook.com', 'www.facebook.com', 'm.facebook.com', 'fb.watch', 'www.fb.watch'];
    return url.protocol === 'https:' && allowed.includes(url.hostname) ? url.href : null;
  } catch {
    return null;
  }
};

const safeImageUrl = (value) => {
  try {
    const url = new URL(value, document.baseURI);
    const sameOrigin = url.origin === window.location.origin && url.pathname.includes('/images/');
    const facebookCdn = url.protocol === 'https:' && (url.hostname.endsWith('.fbcdn.net') || url.hostname === 'fbcdn.net');
    return sameOrigin || facebookCdn ? url.href : null;
  } catch {
    return null;
  }
};

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/gu, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[char]);

const facebookEmbedUrl = (href, width = 560) => {
  const validUrl = safeFacebookUrl(href);
  if (!validUrl) return null;
  const embed = new URL('https://www.facebook.com/plugins/video.php');
  embed.searchParams.set('href', validUrl);
  embed.searchParams.set('show_text', 'false');
  embed.searchParams.set('width', String(width));
  return embed.href;
};

const timestampOf = (item) => {
  const value = item?.createdAt || (item?.date ? `${item.date}T12:00:00+03:00` : '');
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const isRecent = (item, days = FALLBACK_RETENTION_DAYS) => timestampOf(item) >= Date.now() - days * 86_400_000;

const getStatus = () => document.getElementById('facebook-sync-status');

function setStatus(message, state = 'neutral') {
  const status = getStatus();
  if (!status) return;
  status.textContent = message;
  status.dataset.state = state;
}

function updateSchedule(schedule, retentionDays) {
  const wrapper = document.getElementById('schedule-current');
  const empty = document.getElementById('schedule-empty');
  const post = schedule && isRecent(schedule, retentionDays) ? schedule : null;
  if (!wrapper || !empty) return;

  if (!post) {
    wrapper.hidden = true;
    empty.hidden = false;
    const eyebrow = document.getElementById('schedule-hero-eyebrow');
    const intro = document.getElementById('hero-schedule-intro');
    if (eyebrow) eyebrow.textContent = 'ПАРАФІЯЛЬНЕ ОГОЛОШЕННЯ · ОЧІКУЄМО ОНОВЛЕННЯ';
    if (intro) intro.textContent = 'Найновіші дати й час богослужінь з’являться тут після нового допису парафії.';
    return;
  }

  const href = safeFacebookUrl(post.href);
  wrapper.hidden = false;
  empty.hidden = true;
  wrapper.dataset.createdAt = post.createdAt || `${post.date}T12:00:00+03:00`;
  wrapper.dataset.source = 'facebook-api';
  const dateEl = document.getElementById('schedule-post-date');
  const titleEl = document.getElementById('schedule-post-title');
  const textEl = document.getElementById('schedule-post-text');
  if (dateEl) dateEl.textContent = `Оголошення опубліковано ${post.dateLabel || post.date}`;
  if (titleEl) titleEl.textContent = post.title || 'Оголошення про богослужіння';
  if (textEl) textEl.textContent = post.text || '';
  const eyebrow = document.getElementById('schedule-hero-eyebrow');
  if (eyebrow) eyebrow.textContent = `ПАРАФІЯЛЬНЕ ОГОЛОШЕННЯ · ${post.dateLabel || post.date}`;
  const intro = document.getElementById('hero-schedule-intro');
  if (intro) intro.textContent = `Найновіше оголошення парафії · ${post.dateLabel || post.date}.`;
  const link = document.getElementById('schedule-source');
  if (link) link.href = href || 'https://www.facebook.com/profile.php?id=100074930874982';
}

function updateWorship(data, retentionDays) {
  const player = document.getElementById('worship-player');
  const badge = document.getElementById('worship-live-badge');
  const feature = document.getElementById('worship-feature');
  const archive = document.getElementById('worship-archive-grid') || document.querySelector('.worship-archive-grid');
  const emptyArchive = document.getElementById('worship-archive-empty');
  if (!player || !badge || !feature || !archive || !emptyArchive) return;
  if (player.dataset.source === 'admin') return;

  const videos = (Array.isArray(data.videos) ? data.videos : []).filter((video) => isRecent(video, retentionDays));
  const current = data.liveVideo && isRecent(data.liveVideo, retentionDays) ? data.liveVideo : (videos[0] || null);
  const archiveVideos = videos.filter((video) => video.id !== current?.id).slice(0, 6);
  const frame = player.querySelector('iframe');

  if (current) {
    const href = safeFacebookUrl(current.href);
    const embed = href ? facebookEmbedUrl(href) : null;
    if (embed && frame) frame.src = embed;
    player.dataset.videoUrl = href || '';
    player.dataset.live = String(Boolean(data.liveVideo && current.id === data.liveVideo.id));
    player.dataset.createdAt = current.createdAt || '';
    player.dataset.source = 'facebook-api';
    feature.hidden = false;
    badge.classList.toggle('is-live', Boolean(current.isLive));
    badge.dataset.live = String(Boolean(current.isLive));
    const liveLabel = badge.querySelector('.worship-live-label');
    if (liveLabel) liveLabel.textContent = current.isLive ? 'LIVE' : 'Останній запис';
    badge.setAttribute('aria-label', current.isLive ? 'Зараз триває прямий ефір' : 'Показано останній збережений запис');
    const featureDate = document.getElementById('worship-feature-date');
    const featureTitle = document.getElementById('worship-feature-title');
    const featureDescription = document.getElementById('worship-feature-description');
    const featureLink = document.getElementById('worship-feature-link');
    const featureRecord = document.getElementById('worship-feature-record-link');
    if (featureDate) featureDate.textContent = `${current.isLive ? 'ПРЯМИЙ ЕФІР' : 'ОСТАННІЙ ЗАПИС'} · ${current.dateLabel || ''}`;
    if (featureTitle) featureTitle.textContent = current.title || 'Богослужіння у Петропавлівському храмі';
    if (featureDescription) featureDescription.textContent = current.text || 'Перегляньте богослужіння зі сторінки Петропавлівської парафії.';
    if (featureLink) featureLink.href = href || 'https://www.facebook.com/protoierej.oleksandr.cisar';
    if (featureRecord) featureRecord.href = href || 'https://www.facebook.com/protoierej.oleksandr.cisar';
    if (frame) frame.title = `${current.title || 'Богослужіння'} · Facebook`;
  } else {
    feature.hidden = true;
    badge.classList.remove('is-live');
    badge.dataset.live = 'false';
    const liveLabel = badge.querySelector('.worship-live-label');
    if (liveLabel) liveLabel.textContent = 'Немає записів за 14 днів';
    badge.setAttribute('aria-label', 'Немає нещодавніх відеозаписів');
  }

  archive.innerHTML = archiveVideos.map((video) => {
    const href = safeFacebookUrl(video.href);
    const embed = href ? facebookEmbedUrl(href, 560) : null;
    if (!embed) return '';
    return `<article class="worship-archive-card" data-created-at="${escapeHtml(video.createdAt)}" data-source="facebook-api">
      <div class="worship-archive-player"><iframe title="${escapeHtml(video.title || 'Запис богослужіння')} у Facebook" loading="lazy" src="${escapeHtml(embed)}" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowfullscreen></iframe></div>
      <div class="worship-archive-copy"><p class="worship-meta">${escapeHtml(video.dateLabel || '')} · FACEBOOK</p><h4>${escapeHtml(video.title || 'Запис богослужіння')}</h4><a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">Дивитися ↗</a></div>
    </article>`;
  }).join('');
  emptyArchive.hidden = archiveVideos.length > 0;
}

function expireStaticContent(retentionDays = FALLBACK_RETENTION_DAYS) {
  const schedule = document.getElementById('schedule-current');
  const empty = document.getElementById('schedule-empty');
  if (schedule) {
    const recent = isRecent({ createdAt: schedule.dataset.createdAt }, retentionDays);
    schedule.hidden = !recent;
    if (empty) empty.hidden = recent;
    if (!recent) {
      const eyebrow = document.getElementById('schedule-hero-eyebrow');
      const intro = document.getElementById('hero-schedule-intro');
      if (eyebrow) eyebrow.textContent = 'ПАРАФІЯЛЬНЕ ОГОЛОШЕННЯ · ОЧІКУЄМО ОНОВЛЕННЯ';
      if (intro) intro.textContent = 'Найновіші дати й час богослужінь з’являться тут після нового допису парафії.';
    }
  }

  document.querySelectorAll('.worship-archive-card[data-created-at]').forEach((card) => {
    card.hidden = !isRecent({ createdAt: card.dataset.createdAt }, retentionDays);
  });

  const mainPlayer = document.getElementById('worship-player');
  const feature = document.getElementById('worship-feature');
  if (mainPlayer && feature && mainPlayer.dataset.source !== 'admin') {
    const recent = isRecent({ createdAt: mainPlayer.dataset.createdAt }, retentionDays);
    feature.hidden = !recent;
    if (!recent) {
      const badge = document.getElementById('worship-live-badge');
      if (badge) {
        badge.classList.remove('is-live');
        badge.dataset.live = 'false';
        const liveLabel = badge.querySelector('.worship-live-label');
        if (liveLabel) liveLabel.textContent = 'Немає записів за 14 днів';
        badge.setAttribute('aria-label', 'Немає нещодавніх відеозаписів');
      }
    }
  }

  const archive = document.getElementById('worship-archive-grid') || document.querySelector('.worship-archive-grid');
  const emptyArchive = document.getElementById('worship-archive-empty');
  if (archive && emptyArchive) emptyArchive.hidden = [...archive.querySelectorAll('.worship-archive-card')].some((card) => !card.hidden);
  window.dispatchEvent(new CustomEvent('parish-facebook-retention', { detail: { retentionDays, now: Date.now() } }));
}

function publishSnapshot(data) {
  const retentionDays = Number(data.retentionDays) || FALLBACK_RETENTION_DAYS;
  expireStaticContent(retentionDays);
  const recentPosts = (Array.isArray(data.posts) ? data.posts : []).filter((post) => isRecent(post, retentionDays));
  const recentVideos = (Array.isArray(data.videos) ? data.videos : []).filter((video) => isRecent(video, retentionDays));
  const snapshot = {
    ...data,
    posts: recentPosts,
    videos: recentVideos,
    schedule: data.schedule && isRecent(data.schedule, retentionDays) ? data.schedule : null,
    liveVideo: data.liveVideo && isRecent(data.liveVideo, retentionDays) ? data.liveVideo : null
  };

  const hasSuccessfulSource = Object.values(data.sourceStatus || {}).some(Boolean);
  if (data.configured && data.updatedAt && hasSuccessfulSource) {
    const scheduleSignature = JSON.stringify(snapshot.schedule);
    if (scheduleSignature !== lastScheduleSignature) {
      updateSchedule(snapshot.schedule, retentionDays);
      lastScheduleSignature = scheduleSignature;
    }
    const videoSourceAvailable = Boolean(data.sourceStatus?.parishVideos || data.sourceStatus?.rectorVideos || data.sourceStatus?.parishLive || data.sourceStatus?.rectorLive);
    const videosSignature = JSON.stringify({ videos: snapshot.videos, liveVideo: snapshot.liveVideo, videoSourceAvailable });
    if (videoSourceAvailable && videosSignature !== lastVideosSignature) {
      updateWorship(snapshot, retentionDays);
      lastVideosSignature = videosSignature;
    }
    const postsSignature = JSON.stringify(snapshot.posts);
    if (postsSignature !== lastPostsSignature) {
      window.dispatchEvent(new CustomEvent('parish-facebook-content', { detail: snapshot }));
      lastPostsSignature = postsSignature;
    }
    const synced = new Intl.DateTimeFormat('uk-UA', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Kyiv' }).format(new Date(data.updatedAt));
    const warning = Array.isArray(data.warnings) && data.warnings.length > 0;
    setStatus(warning ? `Часткова синхронізація · ${synced}` : `Оновлено з Facebook о ${synced}`, warning ? 'warning' : 'success');
  } else {
    const unavailable = data.configured && data.updatedAt;
    setStatus(unavailable ? 'Синхронізація очікує дозволів Facebook API' : 'Офіційні богослужіння та трансляції · Facebook', 'neutral');
  }
}

async function refresh() {
  try {
    const response = await fetch(API_URL, { headers: { accept: 'application/json' }, cache: 'no-store' });
    if (!response.ok) throw new Error(`API ${response.status}`);
    publishSnapshot(await response.json());
  } catch {
    setStatus('Офіційні богослужіння та трансляції · Facebook', 'neutral');
  }
}

expireStaticContent();
refresh();
window.setInterval(refresh, FALLBACK_POLL_MS);
