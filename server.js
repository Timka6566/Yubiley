import express from 'express';
import cors from 'cors';
import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs/promises';

const TELEGRAM_BOT_TOKEN = '8422053478:AAFRRb-wSHNJhc49m8O5d4-zSOS2iXoWnGg';
const ADMIN_CHAT_IDS = ['5060105414', '6110524452'];
const PORT = 3001;
const DATA_FILE = './data.json';
const GUEST_PAGE_SIZE = 5;

const readData = async () => {
  try {
    const fileContent = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    console.error('Ошибка чтения файла с данными:', error);
    return [];
  }
};

const writeData = async (data) => {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Ошибка записи в файл данных:', error);
  }
};

const isAdmin = (chatId) => ADMIN_CHAT_IDS.includes(String(chatId));

const app = express();
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

app.use(cors());
app.use(express.json());

app.post('/api/rsvp', async (req, res) => {
  const newResponse = req.body;
  console.log('Получены данные:', newResponse);
  const allResponses = await readData();
  allResponses.push(newResponse);
  await writeData(allResponses);
  console.log('Ответ сохранен в', DATA_FILE);
  const { name, attendance, alcohol, message } = newResponse;
  const messageText = `
🔔 *Новый ответ!* 

*Имя:* ${name}
*Присутствие:* ${attendance === 'yes' ? '✅ Да' : attendance === 'maybe' ? '🤔 Возможно' : '❌ Нет'}
*Алкоголь:* ${alcohol.join(', ') || 'не указан'}
*Сообщение:*
${message || 'пусто'}
  `;
  const sendPromises = ADMIN_CHAT_IDS.map(chatId => bot.sendMessage(chatId, messageText, { parse_mode: 'Markdown' }));
  try {
    await Promise.all(sendPromises);
    console.log('Уведомления отправлены всем администраторам.');
    res.status(200).json({ success: true, message: 'Ответ отправлен.' });
  } catch (error) {
    console.error('Ошибка отправки в Telegram:', error.response ? error.response.body : error);
    res.status(500).json({ success: false, message: 'Ошибка сервера при отправке в Telegram.' });
  }
});


const sendGuestList = async (chatId, page = 0, messageId = null, callbackQueryId = null) => {
  const allResponses = await readData();
  const attendingGuests = allResponses
    .map((guest, index) => ({ ...guest, originalIndex: index }))
    .filter(g => g.attendance === 'yes');
  if (attendingGuests.length === 0) {
    bot.sendMessage(chatId, 'ℹ️ Пока что ни один гость не подтвердил присутствие.');
    return;
  }
  const totalPages = Math.ceil(attendingGuests.length / GUEST_PAGE_SIZE);
  const currentPage = Math.max(0, Math.min(page, totalPages - 1));
  const startIndex = currentPage * GUEST_PAGE_SIZE;
  const guestsOnPage = attendingGuests.slice(startIndex, startIndex + GUEST_PAGE_SIZE);
  let text = `👥 *Список гостей (Страница ${currentPage + 1}/${totalPages})*\n\n`;
  const keyboard = [];
  guestsOnPage.forEach(guest => {
    text += `--- ---\n👤 *${guest.name}*\n🥂 Алкоголь: ${guest.alcohol.join(', ') || 'не указан'}\n💬 Сообщение: _${guest.message || 'пусто'} _\n`;
    keyboard.push([{ 
      text: `❌ Удалить ${guest.name.split(' ')[0]}`, 
      callback_data: `delete_${guest.originalIndex}_${currentPage}` 
    }]);
  });
  const paginationButtons = [];
  if (currentPage > 0) {
    paginationButtons.push({ text: '◀️ Назад', callback_data: `list_page_${currentPage - 1}` });
  }
  paginationButtons.push({ text: `Стр. ${currentPage + 1}/${totalPages}`, callback_data: 'noop' });
  if (currentPage < totalPages - 1) {
    paginationButtons.push({ text: 'Вперед ▶️', callback_data: `list_page_${currentPage + 1}` });
  }
  keyboard.push(paginationButtons);
  const options = {
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: keyboard }
  };
  try {
    if (messageId) {
      await bot.editMessageText(text, { chat_id: chatId, message_id: messageId, ...options });
    } else {
      await bot.sendMessage(chatId, text, options);
    }
  } catch (error) {
    console.error("Ошибка отправки/редактирования списка гостей:", error);
    if (callbackQueryId && error.response && error.response.body.description.includes("message is not modified")) {
        bot.answerCallbackQuery(callbackQueryId, { text: "На этой странице нет изменений." });
    } else if (!messageId) {
        bot.sendMessage(chatId, "Ошибка при создании списка.");
    }
  }
};

bot.onText( /\/start/, (msg) => {
  if (!isAdmin(msg.chat.id)) return;
  bot.sendMessage(msg.chat.id, "Бот активен. Команды:\n/stats - Общая статистика\n/list - Список гостей\n/alcohol - Статистика по алкоголю");
});

bot.onText( /\/list/, async (msg) => {
  if (!isAdmin(msg.chat.id)) return;
  sendGuestList(msg.chat.id, 0);
});

bot.onText( /\/alcohol/, async (msg) => {
    if (!isAdmin(msg.chat.id)) {
        bot.sendMessage(msg.chat.id, "У вас нет прав.");
        return;
    }
    const responses = await readData();
    const attendingGuests = responses.filter(r => r.attendance === 'yes');

    if (attendingGuests.length === 0) {
        bot.sendMessage(msg.chat.id, "Пока нет ответов от гостей, которые придут.");
        return;
    }

    const alcoholPreferences = {};
    let totalAlcoholChoices = 0;

    attendingGuests.forEach(guest => {
        if (guest.alcohol && guest.alcohol.length > 0) {
            guest.alcohol.forEach(drink => {
                if (drink !== 'Не пью алкоголь') {
                    alcoholPreferences[drink] = (alcoholPreferences[drink] || 0) + 1;
                    totalAlcoholChoices++;
                }
            });
        }
    });

    if (totalAlcoholChoices === 0) {
        bot.sendMessage(msg.chat.id, "Никто из гостей еще не выбрал алкоголь.");
        return;
    }

    let message = `🍾 *Статистика по алкоголю*\n\nВсего выбрано позиций: *${totalAlcoholChoices}*\n\n*По типам:*\n`;
    for (const [drink, count] of Object.entries(alcoholPreferences)) {
        message += `  - ${drink}: *${count}*\n`;
    }

    bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
});

bot.onText( /\/stats/, async (msg) => {
    if (!isAdmin(msg.chat.id)) {
        bot.sendMessage(msg.chat.id, "У вас нет прав.");
        return;
    }
    const responses = await readData();
    if (!responses || responses.length === 0) {
        bot.sendMessage(msg.chat.id, "Пока нет ответов.");
        return;
    }
    const totalResponses = responses.length;
    const attending = responses.filter(r => r.attendance === 'yes');
    const notAttending = responses.filter(r => r.attendance === 'no');
    const maybe = responses.filter(r => r.attendance === 'maybe');
    const alcoholPreferences = {};
    const nonDrinkers = new Set();
    attending.forEach(guest => {
        if (guest.alcohol && guest.alcohol.length > 0) {
            if (guest.alcohol.includes('Не пью алкоголь')) {
                nonDrinkers.add(guest.name);
            } else {
                guest.alcohol.forEach(drink => {
                    alcoholPreferences[drink] = (alcoholPreferences[drink] || 0) + 1;
                });
            }
        } else {
            nonDrinkers.add(guest.name);
        }
    });
    const drinkersCount = attending.length - nonDrinkers.size;
    let statsMessage = `📊 *Статистика по гостям*\n\nВсего ответов: *${totalResponses}*\n\n`;
    statsMessage += `*Присутствие:*
`;
    statsMessage += `  - ✅ Придут: *${attending.length}*
`;
    statsMessage += `  - ❌ Не придут: *${notAttending.length}*
`;
    statsMessage += `  - 🤔 Возможно: *${maybe.length}*
\n`;
    if (attending.length > 0) {
        statsMessage += `*Из тех, кто придет (${attending.length}):*
`;
        statsMessage += `  - 🥂 Пьющие: *${drinkersCount}*
`;
        statsMessage += `  - 🥤 Непьющие: *${nonDrinkers.size}*
\n`;
        if (Object.keys(alcoholPreferences).length > 0) {
            statsMessage += `*Предпочтения по алкоголю (в /stats):*
`;
            for (const [drink, count] of Object.entries(alcoholPreferences)) {
                statsMessage += `  - ${drink}: *${count}*
`;
            }
        }
    }
    bot.sendMessage(msg.chat.id, statsMessage, { parse_mode: 'Markdown' });
});

bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;
  const chatId = msg.chat.id;
  if (!isAdmin(chatId)) {
    bot.answerCallbackQuery(callbackQuery.id, { text: "У вас нет прав." });
    return;
  }
  if (data === 'noop') {
      bot.answerCallbackQuery(callbackQuery.id);
      return;
  }
  const [action, ...params] = data.split('_');
  if (action === 'list' && params[0] === 'page') {
    const page = parseInt(params[1], 10);
    await sendGuestList(chatId, page, msg.message_id, callbackQuery.id);
    bot.answerCallbackQuery(callbackQuery.id);
  }
  if (action === 'delete') {
    const originalIndex = parseInt(params[0], 10);
    const currentPage = parseInt(params[1], 10);
    const allResponses = await readData();
    const guestToDelete = allResponses[originalIndex];
    if (guestToDelete) {
        const updatedResponses = allResponses.filter((_, index) => index !== originalIndex);
        await writeData(updatedResponses);
        console.log(`Админ ${chatId} удалил гостя:`, guestToDelete);
        bot.answerCallbackQuery(callbackQuery.id, { text: `✅ Гость "${guestToDelete.name}" удален.` });
        await sendGuestList(chatId, currentPage, msg.message_id, callbackQuery.id);
    } else {
        bot.answerCallbackQuery(callbackQuery.id, { text: '⚠️ Ошибка: Гость не найден. Возможно, уже удален?', show_alert: true });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

console.log('Телеграм бот запущен в режиме polling...');
