/**
 * Захист форм від ботів (Cloudflare Turnstile) і сповіщення про нові заявки/записки на пошту (Resend).
 * Усе необов'язкове: без відповідних змінних середовища відповідна функція просто вимкнена.
 */
const env = (name) => String(process.env[name] || '').trim();

export const turnstileEnabled = () => Boolean(env('TURNSTILE_SECRET_KEY'));

/** Перевіряє токен капчі на боці Cloudflare. Без секретного ключа капча вимкнена, і запит пропускається. */
export async function verifyTurnstile(token, ip) {
  if (!turnstileEnabled()) return { ok: true };
  if (!token || typeof token !== 'string' || token.length > 4096) return { ok: false, reason: 'missing' };
  try {
    const form = new URLSearchParams({ secret: env('TURNSTILE_SECRET_KEY'), response: token });
    if (ip && ip !== 'local' && ip !== 'unknown') form.set('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form, signal: AbortSignal.timeout(6000) });
    const data = await res.json();
    return data?.success === true ? { ok: true } : { ok: false, reason: 'failed' };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

const clip = (value, max) => String(value ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').slice(0, max);

const TYPE_LABEL = { baptism: 'Хрещення', wedding: 'Вінчання' };
const KIND_LABEL = { health: 'За здоров’я', repose: 'За упокій' };

/** Текст сповіщення без розмітки, щоб введені користувачем символи не могли нічого зламати */
export function describeEvent(kind, entry) {
  if (kind === 'request') {
    return [
      `Нова заявка: ${TYPE_LABEL[entry.type] || clip(entry.type, 30)}`,
      `Ім’я: ${clip(entry.name, 80)}`,
      `Телефон: ${clip(entry.phone, 20)}`,
      entry.date ? `Бажана дата: ${clip(entry.date, 10)}` : '',
      entry.intention ? `Коментар: ${clip(entry.intention, 600)}` : '',
    ].filter(Boolean).join('\n');
  }
  return [`Нова записка: ${KIND_LABEL[entry.kind] || clip(entry.kind, 20)}`, ...(entry.names || []).slice(0, 30).map((n, i) => `${i + 1}. ${clip(n, 80)}`)].join('\n');
}

async function email(subject, text) {
  const key = env('RESEND_API_KEY');
  const to = env('NOTIFY_EMAIL_TO');
  if (!key || !to) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env('NOTIFY_EMAIL_FROM') || 'Парафія <onboarding@resend.dev>', to: to.split(',').map((a) => a.trim()).filter(Boolean), subject, text }),
    signal: AbortSignal.timeout(5000),
  });
}

/** Надсилає сповіщення в усі налаштовані канали. Помилка сповіщення ніколи не заважає прийняти заявку. */
export async function notifyParish(kind, entry) {
  const text = describeEvent(kind, entry);
  const subject = kind === 'request' ? 'Нова заявка на сайті парафії' : 'Нова записка на сайті парафії';
  await Promise.allSettled([email(subject, text)]);
}
