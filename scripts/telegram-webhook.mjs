// Підключає Telegram-бота до сайту: node --env-file=.env scripts/telegram-webhook.mjs https://ваш-домен
const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
const site = (process.argv[2] || process.env.SITE_URL || '').replace(/\/+$/, '');
if (!token || !secret || !site) {
  console.error('Потрібні TELEGRAM_BOT_TOKEN і TELEGRAM_WEBHOOK_SECRET у .env та адреса сайту: node --env-file=.env scripts/telegram-webhook.mjs https://ваш-домен');
  process.exit(1);
}
const call = async (method, payload) => (await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })).json();

const hook = await call('setWebhook', { url: `${site}/api/telegram`, secret_token: secret, allowed_updates: ['message', 'callback_query'], drop_pending_updates: true });
console.log('Вебхук:', hook.ok ? `підключено → ${site}/api/telegram` : hook.description);
const cmds = await call('setMyCommands', { commands: [
  { command: 'requests', description: 'Нові заявки' },
  { command: 'notes', description: 'Нові записки' },
  { command: 'stats', description: 'Підсумок' },
] });
console.log('Меню команд:', cmds.ok ? 'налаштовано' : cmds.description);
