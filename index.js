const express = require("express");
const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");

const app = express();
const PORT = process.env.PORT || 3000;

// Web server สำหรับ Render
app.get("/", (req, res) => {
  res.send("Bot is running!");
});

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});

// Discord Client
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

// เมื่อมีข้อความใหม่
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // ตรวจว่าห้องชื่อ ticket ไหม
  if (!message.channel.name.includes("ticket")) return;

  try {
    const messages = await message.channel.messages.fetch({ limit: 20 });

    const customerMessage = messages.find(
      (m) =>
        !m.author.bot &&
        (m.member ||
          m.memberPermissions?.has(
            PermissionsBitField.Flags.Administrator
          ))
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

    // ถ้าลูกค้าพิมพ์ล่าสุดไม่เกิน 30 วิ
    // จะไม่ส่ง DM
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
      .setFooter({ text: "XB00TS Support" });

    await user.send({ embeds: [embed] });

    console.log(`ส่ง DM หา ${user.tag} แล้ว`);
  } catch (err) {
    console.error(err);
  }
});

// LOGIN
client.login(process.env.TOKEN);
