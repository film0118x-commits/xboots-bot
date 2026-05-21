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

    // ห้องต้องมีคำว่า ticket
    if (!message.channel.name.includes("ticket")) return;

    // ดึงข้อความล่าสุด
    const messages = await message.channel.messages.fetch({
      limit: 20,
    });

    // หา "ลูกค้า"
    // ที่ไม่ใช่ bot
    // และไม่ใช่คนที่พิมพ์ล่าสุด
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

    const now = Date.now();

    const lastCustomerMessageTime =
      customerMessage.createdTimestamp;

    const diff = now - lastCustomerMessageTime;

    // ถ้าลูกค้าเพิ่งพิมพ์ภายใน 30 วิ
    // จะไม่ส่ง DM
    if (diff < 30000) {
      console.log("⏳ ลูกค้ากำลังอ่าน Ticket อยู่");
      return;
    }

    // fetch user
    const user = await client.users.fetch(userId);

    // ลิงก์ Ticket
    const guildId = message.guild.id;

    const ticketLink =
      `https://discord.com/channels/${guildId}/${message.channel.id}`;

    // EMBED
    const embed = new EmbedBuilder()
      .setColor("#00C2FF")
      .setTitle("XB00TS แจ้งเตือน")
      .setDescription(`
🔹 แจ้งเตือนจากทีม XBOOTS

✅ แอดมินตอบ Ticket ของคุณแล้ว

📩 กรุณากลับไปตรวจสอบ Ticket

🎫 [กดเปิด Ticket](${ticketLink})
      `)
      .setFooter({
        text: "XB00TS Support",
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
