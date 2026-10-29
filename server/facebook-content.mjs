const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RETENTION_DAYS = 14;
const DEFAULT_SYNC_INTERVAL_MS = 60 * 1000;

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Kyiv'
  }).format(date);
}

function postCategory(message) {
  const text = message.toLocaleLowerCase('uk-UA');
  if (/(розклад|богослуж|літург|служба божа|вечірн|сповід|панахид)/u.test(text)) return 'schedule';
  if (/(волонтер|пожертв|донат|збір|допомог|підтримк)/u.test(text)) return 'volunteer';
  if (/(оголош|запрошу|свято|хрещ|вінчан|молеб|зустріч|помин)/u.test(text)) return 'event';
  return 'general';
}

function postTitle(message, fallback) {
  const firstLine = cleanText(message).split(/\r?\n/u).find(Boolean) || fallback;
  return firstLine.length > 120 ? `${firstLine.slice(0, 117).trimEnd()}…` : firstLine;
}

function withinRetention(dateValue, cutoff) {
  const timestamp = new Date(dateValue).getTime();
  return Number.isFinite(timestamp) && timestamp >= cutoff;
}

function normalizePost(post, source, cutoff) {
  if (!withinRetention(post.created_time, cutoff)) return null;
  const message = cleanText(post.message || post.story || post.description);
  if (!message) return null;

  const createdAt = new Date(post.created_time).toISOString();
  const category = postCategory(message);
  const attachment = post.attachments?.data?.[0];
  const imageUrl = cleanText(post.full_picture || attachment?.media?.image?.src || attachment?.url);

  return {
    id: String(post.id),
    source,
    createdAt,
    date: createdAt.slice(0, 10),
    dateLabel: formatDate(createdAt),
    category,
    type: category === 'schedule' ? 'Богослужіння' : category === 'volunteer' ? 'Волонтерство' : 'Оголошення',
    title: postTitle(message, category === 'schedule' ? 'Оголошення про богослужіння' : 'Оголошення парафії'),
    text: message,
    href: cleanText(post.permalink_url) || `https://www.facebook.com/${encodeURIComponent(post.id)}`,
    imageUrl: imageUrl.startsWith('https://') ? imageUrl : null
  };
}

function normalizeVideo(video, source, profileId, cutoff) {
  const created = video.created_time || video.creation_time;
  if (!withinRetention(created, cutoff)) return null;
  const createdAt = new Date(created).toISOString();
  const description = cleanText(video.description || video.title);
  const title = postTitle(description, 'Збережений запис богослужіння');
  const permalink = cleanText(video.permalink_url);
  const href = permalink || `https://www.facebook.com/${encodeURIComponent(profileId)}/videos/${encodeURIComponent(video.id)}/`;
  const status = cleanText(video.status?.video_status || video.status || video.live_status).toUpperCase();

  return {
    id: String(video.id),
    source,
    createdAt,
    dateLabel: formatDate(createdAt),
    title,
    text: description,
    href,
    imageUrl: cleanText(video.picture) || null,
    isLive: video.is_live_streaming === true || ['LIVE', 'LIVE_NOW', 'LIVE_STREAMING'].includes(status)
  };
}

function blankSnapshot(configured, postsConfigured, videosConfigured, retentionDays) {
  return {
    configured,
    postsConfigured,
    videosConfigured,
    retentionDays,
    syncIntervalMs: DEFAULT_SYNC_INTERVAL_MS,
    updatedAt: null,
    posts: [],
    schedule: null,
    videos: [],
    liveVideo: null,
    sourceStatus: {},
    warnings: []
  };
}

export function createFacebookContentService(env = {}) {
  const pageId = cleanText(env.FACEBOOK_PAGE_ID || '100059029128700');
  const pageToken = cleanText(env.FACEBOOK_PAGE_ACCESS_TOKEN);
  const rectorProfileId = cleanText(env.FACEBOOK_RECTOR_PROFILE_ID);
  const rectorToken = cleanText(env.FACEBOOK_RECTOR_USER_ACCESS_TOKEN);
  const apiVersionValue = cleanText(env.META_GRAPH_API_VERSION || 'v26.0');
  const apiVersion = apiVersionValue.startsWith('v') ? apiVersionValue : `v${apiVersionValue}`;
  const retentionDays = Math.max(1, Number(env.FACEBOOK_CONTENT_RETENTION_DAYS) || DEFAULT_RETENTION_DAYS);
  const intervalMs = Math.max(60_000, Number(env.FACEBOOK_SYNC_INTERVAL_MS) || DEFAULT_SYNC_INTERVAL_MS);
  const postsConfigured = Boolean((pageId && pageToken) || (rectorProfileId && rectorToken));
  const videosConfigured = Boolean((pageId && pageToken) || (rectorProfileId && rectorToken));
  const configured = postsConfigured || videosConfigured;

  let snapshot = blankSnapshot(configured, postsConfigured, videosConfigured, retentionDays);
  snapshot.syncIntervalMs = intervalMs;
  let lastSyncAttempt = 0;
  let syncInFlight = null;
  let timer = null;

  async function graphGet(path, token, fields, limit = 100) {
    const url = new URL(`https://graph.facebook.com/${apiVersion}/${path}`);
    url.searchParams.set('access_token', token);
    url.searchParams.set('fields', fields);
    url.searchParams.set('limit', String(limit));
    const response = await fetch(url, { headers: { accept: 'application/json' } });
    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new Error(`Meta Graph API повернув нечитабельну відповідь (${response.status}).`);
    }
    if (!response.ok || payload.error) {
      const code = payload.error?.code ? `, код ${payload.error.code}` : '';
      throw new Error(`Meta Graph API відхилив запит (${response.status}${code}).`);
    }
    return payload;
  }

  async function collect() {
    if (!configured) return snapshot;
    if (syncInFlight) return syncInFlight;

    syncInFlight = (async () => {
      const cutoff = Date.now() - retentionDays * DAY_MS;
      const freshPosts = [];
      const freshVideos = [];
      const successfulSources = new Set();
      const warnings = [];
      let liveVideo = null;

      const jobs = [];
      const pageFields = 'id,message,story,created_time,permalink_url,full_picture,attachments{media_type,type,url,media}';
      const videoFields = 'id,title,description,created_time,permalink_url,picture';
      const liveFields = 'id,title,description,status,creation_time,created_time,permalink_url,picture,is_live_streaming';

      if (pageId && pageToken) {
        jobs.push({ source: 'parish', kind: 'posts', run: () => graphGet(`${pageId}/posts`, pageToken, pageFields) });
        jobs.push({ source: 'parish', kind: 'videos', run: () => graphGet(`${pageId}/videos`, pageToken, videoFields, 50) });
        jobs.push({ source: 'parish', kind: 'live', run: () => graphGet(`${pageId}/live_videos`, pageToken, liveFields, 20) });
      }
      if (rectorProfileId && rectorToken) {
        jobs.push({ source: 'rector', kind: 'posts', run: () => graphGet(`${rectorProfileId}/posts`, rectorToken, pageFields) });
        jobs.push({ source: 'rector', kind: 'videos', run: () => graphGet(`${rectorProfileId}/videos`, rectorToken, videoFields, 50) });
        jobs.push({ source: 'rector', kind: 'live', run: () => graphGet(`${rectorProfileId}/live_videos`, rectorToken, liveFields, 20) });
      }

      const results = await Promise.all(jobs.map(async (job) => {
        try {
          return { job, payload: await job.run() };
        } catch (error) {
          return { job, error };
        }
      }));

      for (const result of results) {
        const { job } = result;
        if (result.error) {
          warnings.push(`${job.source === 'parish' ? 'Сторінка парафії' : 'Профіль настоятеля'}: ${result.error.message}`);
          continue;
        }

        successfulSources.add(`${job.source}:${job.kind}`);
        const rows = Array.isArray(result.payload?.data) ? result.payload.data : [];
        if (job.kind === 'posts') {
          freshPosts.push(...rows.map((post) => normalizePost(post, job.source, cutoff)).filter(Boolean));
        } else if (job.kind === 'videos') {
          const ownerId = job.source === 'parish' ? pageId : rectorProfileId;
          freshVideos.push(...rows.map((video) => normalizeVideo(video, job.source, ownerId, cutoff)).filter(Boolean));
        } else if (job.kind === 'live') {
          const ownerId = job.source === 'parish' ? pageId : rectorProfileId;
          const active = rows
            .map((video) => normalizeVideo(video, job.source, ownerId, cutoff))
            .filter((video) => video?.isLive)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
          if (active) liveVideo = active;
        }
      }

      const previousFresh = (items, kind, source) => snapshot[kind].filter((item) =>
        item.source === source && !successfulSources.has(`${source}:${kind}`) && withinRetention(item.createdAt, cutoff)
      );

      const allPosts = [
        ...freshPosts,
        ...previousFresh(snapshot.posts, 'posts', 'parish'),
        ...previousFresh(snapshot.posts, 'posts', 'rector')
      ];
      const uniquePosts = [...new Map(allPosts.map((post) => [post.id, post])).values()]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 40);
      const allVideos = [
        ...freshVideos,
        ...previousFresh(snapshot.videos, 'videos', 'parish'),
        ...previousFresh(snapshot.videos, 'videos', 'rector')
      ];
      const uniqueVideos = [...new Map(allVideos.map((video) => [video.id, video])).values()]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 20);
      const schedule = uniquePosts.find((post) => post.category === 'schedule') || null;

      snapshot = {
        configured,
        postsConfigured,
        videosConfigured,
        retentionDays,
        syncIntervalMs: intervalMs,
        updatedAt: new Date().toISOString(),
        posts: uniquePosts,
        schedule,
        videos: uniqueVideos,
        liveVideo,
        sourceStatus: {
          parishPosts: successfulSources.has('parish:posts'),
          parishVideos: successfulSources.has('parish:videos'),
          rectorPosts: successfulSources.has('rector:posts'),
          rectorVideos: successfulSources.has('rector:videos'),
          parishLive: successfulSources.has('parish:live'),
          rectorLive: successfulSources.has('rector:live')
        },
        warnings
      };
      return snapshot;
    })().finally(() => {
      syncInFlight = null;
      lastSyncAttempt = Date.now();
    });

    return syncInFlight;
  }

  async function getSnapshot() {
    if (configured && Date.now() - lastSyncAttempt >= intervalMs) await collect();
    const cutoff = Date.now() - retentionDays * DAY_MS;
    const posts = snapshot.posts.filter((item) => withinRetention(item.createdAt, cutoff));
    const videos = snapshot.videos.filter((item) => withinRetention(item.createdAt, cutoff));
    return {
      ...snapshot,
      posts,
      schedule: posts.find((post) => post.category === 'schedule') || null,
      videos,
      liveVideo: snapshot.liveVideo && withinRetention(snapshot.liveVideo.createdAt, cutoff) ? snapshot.liveVideo : null
    };
  }

  function start() {
    if (!configured || timer) return;
    collect();
    timer = setInterval(() => collect(), intervalMs);
    timer.unref?.();
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  return { configured, getSnapshot, syncNow: collect, start, stop };
}

export function createFacebookContentMiddleware(service) {
  return async function facebookContentMiddleware(request, response, next) {
    const requestUrl = new URL(request.url || '/', 'http://localhost');
    const path = requestUrl.pathname.replace(/^\/apostol(?=\/|$)/, '') || '/';
    if (path !== '/api/facebook-content') return next();
    if (request.method !== 'GET') {
      response.statusCode = 405;
      response.setHeader('Allow', 'GET');
      response.end('Method Not Allowed');
      return;
    }

    try {
      const payload = await service.getSnapshot();
      response.statusCode = 200;
      response.setHeader('Content-Type', 'application/json; charset=utf-8');
      response.setHeader('Cache-Control', 'no-store, max-age=0');
      response.end(JSON.stringify(payload));
    } catch {
      response.statusCode = 503;
      response.setHeader('Content-Type', 'application/json; charset=utf-8');
      response.setHeader('Cache-Control', 'no-store, max-age=0');
      response.end(JSON.stringify({ configured: service.configured, error: 'Facebook-синхронізація тимчасово недоступна.' }));
    }
  };
}

export function facebookContentPlugin(env) {
  const service = createFacebookContentService(env);
  const middleware = createFacebookContentMiddleware(service);

  function attach(server) {
    server.middlewares.use(middleware);
    service.start();
    server.httpServer?.once('close', () => service.stop());
  }

  return {
    name: 'parish-facebook-content-sync',
    configureServer: attach,
    configurePreviewServer: attach
  };
}
