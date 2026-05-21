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

    // อนุญาตเฉพาะแอดมิน
    if (
      !message.member?.permissions?.has("Administrator")
    ) {
      return;
    }

    // =========================
    // ดึงข้อความล่าสุด
    // =========================

    const messages = await message.channel.messages.fetch({
      limit: 20,
    });

    // หา message ล่าสุดของลูกค้า
    const customerMessage = messages.find(
      (m) =>
        !m.author.bot &&
        !m.member?.permissions?.has("Administrator")
    );

    if (!customerMessage) {
      console.log("❌ ไม่พบลูกค้า");
      return;
    }

    const userId = customerMessage.author.id;

    // =========================
    // เช็คเวลาที่ลูกค้าพิมพ์ล่าสุด
    // =========================

    const now = Date.now();

    const lastCustomerMessageTime =
      customerMessage.createdTimestamp;

    const diff =
      now - lastCustomerMessageTime;

    // 5 นาที = 300000 ms
    if (diff < 5 * 60 * 1000) {
      console.log(
        "🛑 ลูกค้ายังคุยอยู่ ไม่ส่งแจ้งเตือน"
      );
      return;
    }

    console.log(
      "✅ ลูกค้าเงียบเกิน 5 นาที ส่ง DM ได้"
    );

    // =========================
    // ดึง user
    // =========================

    const user = await client.users.fetch(userId);

    // แท็กห้อง ticket
    const ticketTag = `<#${message.channel.id}>`;

    // =========================
    // EMBED
    // =========================

    const embed = new EmbedBuilder()
      .setColor("#8A2BE2")

      .setAuthor({
        name: "XBOOTS SUPPORT",
      })

      .setDescription(`
🔹 • แจ้งเตือนจากร้าน XBOOTS

✅ • แอดมินตอบ Ticket ของคุณแล้ว

🎟️ • TK ของคุณ: ${ticketTag}
      `)

      .setImage(
        "https://raw.githubusercontent.com/film0118x-commits/xboots-bot/main/X1.png"
      );

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
