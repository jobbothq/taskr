require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const BOT_TOKEN = process.env.BOT_TOKEN;
const N8N_WEBHOOK_URL = "https://gabescalendar.app.n8n.cloud/webhook/taskr";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();

  // Determine command type
  let action = null;

  if (content.startsWith("/add")) action = "add";
  else if (content.startsWith("/delete")) action = "delete";
  else if (content.startsWith("/done")) action = "done";
  else if (content.startsWith("/list")) action = "list";

  if (action) {
    console.log(`📤 Sending "${action}" to ${N8N_WEBHOOK_URL}`);

    try {
      const res = await axios.post(N8N_WEBHOOK_URL, {
        message: content,
        user: message.author.username
      });

      // Auto-reply with response (optional)
      if (res?.data?.reply) {
        await message.reply(res.data.reply);
      } else {
        await message.reply(`✅ ${action} request sent to Joblytics.`);
      }
    } catch (error) {
      console.error(`❌ Failed to send ${action}:`, error.message);
      await message.reply(`⚠️ Failed to process ${action} command.`);
    }
  }
});
client.login(BOT_TOKEN);