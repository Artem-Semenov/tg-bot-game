import TelegramBot from "node-telegram-bot-api";
import { gameOptions, againOptions } from "./options.mjs";
import { sequalize } from "./db.mjs";
import { UserModel } from "./models.mjs";

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

const start = async () => {
  try {
    await sequalize.authenticate();
    await sequalize.sync();
    console.log("vse ok");
  } catch (e) {
    console.log("db - error", e);
  }

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
    console.log("chatId", chatId);
    console.log("typeof chatId", typeof chatId);
    try {
      if (text === "/start") {
        await UserModel.findOrCreate({
          where: { chatId: String(chatId) },
        });
        await bot.sendMessage(chatId, "You are welcome");
        return bot.sendSticker(
          chatId,
          "CAACAgIAAxkBAAMOZQ_-S6k3PoVr-zynudr-E1pHduIAAmMAA5KfHhE23tYftq3rOTAE"
        );
      }

      if (text === "/info") {
        const user = await UserModel.findOne({
          where: { chatId: String(chatId) },
        });
        return bot.sendMessage(
          chatId,
          `Your name is ${msg.from.first_name} ${msg.from.last_name}, you have ${user.right} right answers and ${user.wrong} wrong answers`
        );
      }

      if (text === "/play") {
        return startGame(chatId);
      }

      return bot.sendMessage(chatId, "I dont understand you, try again");
    } catch (e) {
      console.log(e);
      return bot.sendMessage(chatId, "error happened, try later");
    }
  });

  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    console.log(data);
    if (data === "again") {
      return startGame(chatId);
    }

    const user = await UserModel.findOne({ where: { chatId: String(chatId) } });

    if (+data === chats[chatId]) {
      user.right += 1;
      await bot.sendMessage(
        chatId,
        `congrats! You guessed right! ${chats[chatId]}`,
        againOptions
      );
    } else {
      user.wrong += 1;
      await bot.sendMessage(
        chatId,
        `NOT RIGHT! bot guessed number ${chats[chatId]}`,
        againOptions
      );
    }
    await user.save();
  });
};

start();
