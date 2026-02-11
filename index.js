const { default: makeWASocket, useMultiFileAuthState, downloadMediaMessage } = require("@whiskeysockets/baileys");
const P = require("pino");
const sharp = require("sharp");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" }),
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || !msg.message.imageMessage) return;

    const buffer = await downloadMediaMessage(
      msg,
      "buffer",
      {},
      { logger: P({ level: "silent" }) }
    );

    const sticker = await sharp(buffer)
      .resize(512, 512, { fit: "contain" })
      .webp()
      .toBuffer();

    await sock.sendMessage(msg.key.remoteJid, { sticker });
  });
}

startBot();
