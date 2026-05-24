async function sendToChannel(client, channelId, payload, label = "canal") {
  try {
    if (!channelId) return;

    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) return;

    await channel.send(payload);
  } catch (error) {
    console.error(`[LOG] Erro ao enviar para ${label}:`, error);
  }
}

async function sendPublicLog(client, payload) {
  await sendToChannel(client, process.env.PUBLIC_LOG_CHANNEL_ID, payload, "ganhos");
}

async function sendAdminLog(client, payload) {
  await sendToChannel(client, process.env.ADMIN_LOG_CHANNEL_ID, payload, "admin-logs");
}

async function sendWithdrawLog(client, payload) {
  await sendToChannel(client, process.env.WITHDRAW_CHANNEL_ID, payload, "saques");
}

module.exports = {
  sendPublicLog,
  sendAdminLog,
  sendWithdrawLog
};