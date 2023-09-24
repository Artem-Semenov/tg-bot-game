import TelegramBot from "node-telegram-bot-api";
import { gameOptions, againOptions } from "./options.mjs";

const token = "6457192186:AAGygcIdB6ro_exECFymtQh7YcHYcozlfQQ";

const bot = new TelegramBot(token, { polling: true });

const chats = {};

const startGame = async (chatId) => {
  await bot.sendMessage(
    chatId,
    `Now I will guess a number from 0 to 9, try to guess it`
  );
  const random = Math.floor(Math.random() * 10);
  chats[chatId] = random;
  console.log(random);
  await bot.sendMessage(chatId, `Guess!`, gameOptions);
};

const start = () => {
  bot.setMyCommands([
    {
      command: "/start",
      description: "start",
    },
    {
      command: "/play",
      description: "play",
    },
    {
      command: "/info",
      description: "info",
    },
  ]);

  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    console.log(msg);

    if (text === "/start") {
      await bot.sendMessage(chatId, "You are welcome");
      return bot.sendSticker(
        chatId,
        "CAACAgIAAxkBAAMOZQ_-S6k3PoVr-zynudr-E1pHduIAAmMAA5KfHhE23tYftq3rOTAE"
      );
    }

    if (text === "/info") {
      return bot.sendMessage(
        chatId,
        `Your name is ${msg.from.first_name} ${msg.from.last_name}`
      );
    }

    if (text === "/play") {
      return startGame(chatId);
    }

    return bot.sendMessage(chatId, "I dont understand you, try again");
  });

  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    console.log(data);
    if (data === "again") {
      return startGame(chatId);
    }

    if (+data === chats[chatId]) {
      return await bot.sendMessage(
        chatId,
        `congrats! You guessed right! ${chats[chatId]}`,
        againOptions
      );
    } else {
      return await bot.sendMessage(
        chatId,
        `NOT RIGHT! bot guessed number ${chats[chatId]}`,
        againOptions
      );
    }
  });
};

start();
