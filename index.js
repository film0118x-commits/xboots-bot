const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField
} = require("discord.js");

require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});

client.once("ready", () => {
  console.log(`${client.user.tag} ออนไลน์แล้ว`);
});

client.on("messageCreate", async (message) => {

  // กันบอท
  if (message.author.bot) return;

  // ตรวจว่าชื่อห้องมีคำว่า ticket
  if (!message.channel.name.includes("ticket")) return;

  // ตรวจว่าเป็นแอดมินไหม
  if (
    !message.member.permissions.has(
      PermissionsBitField.Flags.Administrator
    )
  ) return;

  // ดึง user id จาก topic ห้อง
  const messages = await message.channel.messages.fetch({ limit: 20 });

const customerMessage = messages.find(
m =>
!m.author.bot &&
(
!m.member ||
!m.member.permissions.has(
PermissionsBitField.Flags.Administrator
)
)
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

// ถ้าลูกค้าพิมพ์ล่าสุดไม่เกิน 30 วินาที
// จะไม่ส่ง DM
if (diff < 30000) {
  console.log("ลูกค้ากำลังอ่าน Ticket อยู่");
  return;
}

  try {

    const user = await client.users.fetch(userId);

    const embed = new EmbedBuilder()
.setColor("00C2FF")

.setDescription(`
💠 ・ แจ้งเตือนจากร้าน XBOOTS

✅ ・ แอดมินตอบ Ticket ของคุณแล้ว

🎫 ・ TK ของคุณ: ${message.channel}
`)

.setImage("https://img1.pic.in.th/images/ChatGPT-Image-May-21-2026-04_55_34-AM.png")

.setTimestamp();

    await user.send({
      embeds: [embed]
    });

    console.log("ส่ง DM สำเร็จ");

  } catch (err) {
    console.log("ส่ง DM ไม่สำเร็จ");
    console.log(err);
  }

});

client.login(process.env.TOKEN);