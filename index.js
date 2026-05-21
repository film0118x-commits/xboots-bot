require("dotenv").config();

const express = require("express");
const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
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
  console.log(`Web server running on port ${PORT}`);
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

// Bot Ready
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// =========================
// MESSAGE EVENT
// =========================

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;

    // เช็คว่าช่องมีคำว่า ticket
    if (!message.channel.name.includes("ticket")) return;

    const messages = await message.channel.messages.fetch({
      limit: 20,
    });

    // หา user ล่าสุดที่ไม่ใช่บอท
    const customerMessage = messages.find(
      (m) => !m.author.bot
    );

    if (!customerMessage) {
      console.log("ไม่พบลูกค้าใน Ticket");
      return;
    }

    const userId = customerMessage.author.id;

    const now = Date.now();

    const lastCustomerMessageTime =
      customerMessage.createdTimestamp;

    const diff = now - lastCustomerMessageTime;

    // ถ้าลูกค้าพิมพ์ล่าสุดภายใน 30 วิ ไม่ต้อง DM
    if (diff < 30000) {
      console.log("ลูกค้ากำลังอ่าน Ticket อยู่");
      return;
    }

    const user = await client.users.fetch(userId);

    const embed = new EmbedBuilder()
      .setColor("#00C2FF")
      .setTitle("XB00TS แจ้งเตือน")
      .setDescription(`
🔹 แจ้งเตือนจากทีม XBOOTS

✅ แอดมินตอบ Ticket ของคุณแล้ว

📩 กรุณากลับไปตรวจสอบ Ticket
      `)
      .setFooter({
        text: "XB00TS Support",
      });

    await user.send({
      embeds: [embed],
    });

    console.log(`ส่ง DM หา ${user.tag} แล้ว`);
  } catch (err) {
    console.error("ERROR:", err);
  }
});

// =========================
// LOGIN
// =========================

client.login(process.env.TOKEN);
