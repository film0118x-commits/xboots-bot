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

// เก็บ timeout ของแต่ละ user
const pendingNotifications = new Map();

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
    // ดึงข้อความล่าสุด
    // =========================

    const messages = await message.channel.messages.fetch({
      limit: 20,
    });

    // หา user ลูกค้า
    const customerMessage = messages
      .filter((m) => !m.author.bot)
      .last();

    if (!customerMessage) {
      console.log("❌ ไม่พบลูกค้า");
      return;
    }

    const userId = customerMessage.author.id;

    // =========================
    // ถ้าลูกค้าพิมพ์ -> ยกเลิกแจ้งเตือน
    // =========================

    if (
      !message.member?.permissions?.has("Administrator")
    ) {
      if (pendingNotifications.has(userId)) {
        clearTimeout(pendingNotifications.get(userId));
        pendingNotifications.delete(userId);

        console.log(`🛑 ยกเลิกแจ้งเตือนของ ${userId}`);
      }

      return;
    }

    // =========================
    // แอดมินตอบ
    // =========================

    console.log(`⏳ รอ 5 นาทีก่อนส่ง DM...`);

    // ถ้ามี timeout เดิม -> ลบทิ้ง
    if (pendingNotifications.has(userId)) {
      clearTimeout(pendingNotifications.get(userId));
    }

    // ตั้งเวลาใหม่ 5 นาที
    const timeout = setTimeout(async () => {
      try {

        // =========================
        // เช็คว่าลูกค้าตอบกลับหรือยัง
        // =========================

        const latestMessages = await message.channel.messages.fetch({
          limit: 10,
        });

        const latestCustomerReply = latestMessages.find(
          (m) =>
            !m.author.bot &&
            m.author.id === userId
        );

        // ถ้าลูกค้าพิมพ์ล่าสุด -> ไม่ส่ง DM
        if (
          latestCustomerReply &&
          latestCustomerReply.createdTimestamp >
            message.createdTimestamp
        ) {
          console.log("🛑 ลูกค้าตอบกลับแล้ว ไม่ส่ง DM");
          pendingNotifications.delete(userId);
          return;
        }

        // ดึง user
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

        // ลบ timeout หลังส่งเสร็จ
        pendingNotifications.delete(userId);

      } catch (err) {
        console.error("❌ ERROR ส่ง DM:", err);
      }
    }, 5 * 60 * 1000); // 5 นาที

    // เก็บ timeout
    pendingNotifications.set(userId, timeout);

  } catch (err) {
    console.error("❌ ERROR:", err);
  }
});

// =========================
// LOGIN
// =========================

client.login(process.env.TOKEN);
