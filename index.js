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

    // เฉพาะแอดมิน
    if (
      !message.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      return;
    }

    console.log("📩 ตรวจพบข้อความจากแอดมิน");

    // ดึงข้อความล่าสุด
    const messages = await message.channel.messages.fetch({
      limit: 20,
    });

    // หา user ลูกค้า
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
    // กันส่ง DM ซ้ำ 5 นาที
    // =========================

    const lastSent = cooldown.get(userId);

    if (lastSent && Date.now() - lastSent < 300000) {
      console.log("⏳ กัน DM ซ้ำ 5 นาที");
      return;
    }

    // บันทึกเวลา
    cooldown.set(userId, Date.now());

    console.log("⏳ เริ่มดีเลย์ 5 นาที");

    // =========================
    // ดีเลย์ 5 นาที
    // =========================

    setTimeout(async () => {
      try {
        // ดึง user
        const user = await client.users.fetch(userId);

        // แท็กห้อง ticket
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

          .setFooter({
            text: `วันนี้ เวลา ${new Date().toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            })}`,
          });

        // =========================
        // ส่ง DM
        // =========================

        await user.send({
          embeds: [embed],
        });

        console.log(`✅ ส่ง DM หา ${user.tag} แล้ว`);

      } catch (err) {
        console.error("❌ ERROR ตอนส่ง DM:", err);
      }
    }, 300000); // 300000 = 5 นาที

  } catch (err) {
    console.error("❌ ERROR:", err);
  }
});

// =========================
// LOGIN
// =========================

client.login(process.env.TOKEN);
