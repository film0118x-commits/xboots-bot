require("dotenv").config();

const express = require("express");

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField,
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
// เก็บเวลาล่าสุดที่ลูกค้าพิมพ์
// =========================

const customerLastMessage = new Map();

// =========================
// กันส่ง DM ซ้ำ
// =========================

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

    // =========================
    // เช็คว่าเป็นแอดมินไหม
    // =========================

    const isAdmin = message.member.permissions.has(
      PermissionsBitField.Flags.Administrator
    );

    // =========================
    // ถ้าเป็นลูกค้า -> อัปเดตเวลา
    // =========================

    if (!isAdmin) {
      customerLastMessage.set(
        message.author.id,
        Date.now()
      );

      console.log(
        `💬 ลูกค้าพิมพ์ล่าสุด: ${message.author.tag}`
      );

      return;
    }

    // =========================
    // ดึงข้อความล่าสุด
    // =========================

    const messages = await message.channel.messages.fetch({
      limit: 20,
    });

    // =========================
    // หา user ลูกค้า
    // =========================

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

    // =========================
    // เช็คว่าลูกค้าพิมพ์ภายใน 3 นาทีไหม
    // =========================

    const lastCustomerMessage =
      customerLastMessage.get(userId);

    if (
      lastCustomerMessage &&
      Date.now() - lastCustomerMessage <
        3 * 60 * 1000
    ) {
      console.log(
        "🛑 ลูกค้ายังอยู่หน้า TK ไม่ส่งแจ้งเตือน"
      );
      return;
    }

    // =========================
    // กันส่ง DM ซ้ำภายใน 1 นาที
    // =========================

    const lastSent = cooldown.get(userId);

    if (
      lastSent &&
      Date.now() - lastSent < 60000
    ) {
      console.log("⏳ กัน DM ซ้ำ");
      return;
    }

    cooldown.set(userId, Date.now());

    // =========================
    // ดึง user
    // =========================

    const user = await client.users.fetch(userId);

    // =========================
    // แท็กห้อง ticket
    // =========================

    const ticketTag = `<#${message.channel.id}>`;

    // =========================
    // EMBED
    // =========================

    const embed = new EmbedBuilder()
      .setColor("#8A2BE2")

      .setDescription(`
🔹 • แจ้งเตือนจากร้าน XBOOTS

✅ • แอดมินตอบ Ticket ของคุณแล้ว

🎟️ • TK ของคุณ: ${ticketTag}
      `)

      .setImage(
        "https://raw.githubusercontent.com/film0118x-commits/xboots-bot/main/X1.png"
      )

      // ✅ ตรงนี้เปลี่ยนจากเวลาเป็นชื่อร้าน
      .setFooter({
        text: "XBOOTS SUPPORT",
      });

    // =========================
    // ส่ง DM
    // =========================

    await user.send({
      embeds: [embed],
    });

    console.log(
      `✅ ส่ง DM หา ${user.tag} แล้ว`
    );

  } catch (err) {
    console.error("❌ ERROR:", err);
  }
});

// =========================
// LOGIN
// =========================

client.login(process.env.TOKEN);
