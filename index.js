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
// BOT READY
// =========================

client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// =========================
// MESSAGE EVENT
// =========================

client.on("messageCreate", async (message) => {
  try {
    // กันบอท
    if (message.author.bot) return;

    // กัน DM
    if (!message.guild) return;

    // เช็คว่าห้องมีชื่อ ticket
    if (!message.channel.name) return;

    if (!message.channel.name.includes("ticket")) return;

    // ดึงข้อความล่าสุด
    const messages = await message.channel.messages.fetch({
      limit: 20,
    });

    // หา "ลูกค้า" ล่าสุด
    const customerMessage = messages.find(
      (m) => !m.author.bot
    );

    if (!customerMessage) {
      console.log("❌ ไม่พบลูกค้าใน Ticket");
      return;
    }

    const userId = customerMessage.author.id;

    // ถ้าคนพิมพ์ล่าสุดคือเจ้าของ ticket
    // ไม่ต้องส่ง DM
    if (message.author.id === userId) {
      console.log("⏳ ลูกค้ากำลังคุยอยู่");
      return;
    }

    const now = Date.now();

    const lastCustomerMessageTime =
      customerMessage.createdTimestamp;

    const diff = now - lastCustomerMessageTime;

    // ถ้าลูกค้าพิมพ์ภายใน 30 วิ
    // ไม่ส่ง DM
    if (diff < 30000) {
      console.log("⏳ ลูกค้ากำลังอ่าน Ticket อยู่");
      return;
    }

    // Fetch User
    const user = await client.users.fetch(userId);

    // Embed
    const embed = new EmbedBuilder()
      .setColor("#00C2FF")
      .setTitle("XB00TS แจ้งเตือน")
      .setDescription(`
🔹・แจ้งเตือนจากร้าน XBOOTS

✅・แอดมินตอบ Ticket ของคุณแล้ว

📩・TK ของคุณ
      `)
      .setFooter({
        text: "XB00TS Support",
      })
      .setTimestamp();

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
