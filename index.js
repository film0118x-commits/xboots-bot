require("dotenv").config();

const express = require("express");

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
} = require("discord.js");

// =========================
// EXPRESS WEB SERVER
// =========================

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot is running!");
});

app.listen(PORT, () => {
  console.log(`✅ Web server running on port ${PORT}`);
});

// =========================
// DISCORD CLIENT
// =========================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// กันส่ง DM ซ้ำ
const cooldown = new Map();

// =========================
// READY
// =========================

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// =========================
// MESSAGE EVENT
// =========================

client.on("messageCreate", async (message) => {
  try {
    // กัน bot
    if (message.author.bot) return;

    // ต้องเป็นห้อง ticket
    if (!message.channel.name.includes("ticket")) return;

    // กันลูกค้าพิมพ์เองแล้วบอท DM
    if (!message.member.permissions.has("Administrator")) {
      return;
    }

    // ดึงข้อความล่าสุด
    const messages = await message.channel.messages.fetch({
      limit: 20,
    });

    // หาลูกค้า
    const customerMessage = messages
      .filter(
        (m) =>
          !m.author.bot &&
          m.author.id !== message.author.id
      )
      .first();

    if (!customerMessage) {
      console.log("❌ ไม่พบลูกค้า");
      return;
    }

    const userId = customerMessage.author.id;

    // กันส่ง DM รัว
    const lastSent = cooldown.get(userId);

    if (lastSent && Date.now() - lastSent < 60000) {
      console.log("⏳ กัน DM ซ้ำ");
      return;
    }

    cooldown.set(userId, Date.now());

    // ดึง user
    const user = await client.users.fetch(userId);

    // แท็กห้องแบบกดได้
    const ticketTag = `<#${message.channel.id}>`;

    // =========================
    // EMBED
    // =========================

    const embed = new EmbedBuilder()
      .setColor("#00C2FF")

      .setDescription(`
🔹 • แจ้งเตือนจากร้าน XBOOTS

✅ • แอดมินตอบ Ticket ของคุณแล้ว

🎟️ • TK ของคุณ: ${ticketTag}
      `)

      .setImage(
        "https://i.postimg.cc/pV0Pj6Z4/Chat-GPT-Image-May-21-2026-04-55-34-AM.png"
      )

      .setFooter({
        text: `วันนี้ เวลา ${new Date().toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
      });

    // ส่ง DM
    await user.send({
      embeds: [embed],
    });

    console.log(`✅ ส่ง DM หา ${user.tag} แล้ว`);
  } catch (err) {
    console.error("❌ ERROR:", err);
  }
});

// =========================
// LOGIN
// =========================

client.login(process.env.TOKEN);
