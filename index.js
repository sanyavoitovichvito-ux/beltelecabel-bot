const express = require('express');
const { Telegraf, Markup } = require('telegraf');

const BOT_TOKEN = process.env.BOT_TOKEN;              // токен из BotFather
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;    // длинная случайная строка
const APP_URL = 'https://ai.studio/apps/ВАШ_APP_ID';  // ваш Mini App URL
const DEEP_LINK = 'https://t.me/ВашБот?startapp=home'; // замените ВашБот на юзернейм

if (!BOT_TOKEN) { console.error('Не задан BOT_TOKEN'); process.exit(1); }
if (!WEBHOOK_SECRET) { console.error('Не задан WEBHOOK_SECRET'); process.exit(1); }

const bot = new Telegraf(BOT_TOKEN);

// При /start отправляем кнопку для открытия Mini App
bot.start(async (ctx) => {
  const name = ctx.from?.first_name || 'друг';
  await ctx.reply(
    `Привет, ${name}! Нажми кнопку, чтобы открыть мини‑приложение.`,
    Markup.inlineKeyboard([
      [Markup.button.webApp('Открыть', APP_URL)],
      [Markup.button.url('Открыть ссылкой', DEEP_LINK)]
    ])
  );
});

// По слову «открыть» снова присылаем кнопку
bot.hears(/открыть/i, async (ctx) => {
  await ctx.reply(
    'Открыть Mini App:',
    Markup.inlineKeyboard([[Markup.button.webApp('Открыть', APP_URL)]])
  );
});

// Если Mini App отправит данные через Telegram.WebApp.sendData(...)
bot.on('message', async (ctx) => {
  const webData = ctx.message?.web_app_data?.data;
  if (webData) {
    await ctx.reply(`Данные из Mini App: ${webData}`);
  }
});

const app = express();
app.use(express.json());

// Вебхук с секретом, чтобы его нельзя было угадать
const path = `/webhook/${WEBHOOK_SECRET}`;
app.use(path, bot.webhookCallback(path));

// Простой корневой роут для проверки
app.get('/', (_, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
  console.log(`Webhook path is ${path}`);
  // setWebhook включим после деплоя
});
