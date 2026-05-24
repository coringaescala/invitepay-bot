async function sendToChannel(client, channelId, message, label = "canal") {
  try {
    console.log(`[LOG] Enviando para ${label}:`, channelId);

    if (!channelId) {
      console.log(`[LOG] ${label} sem channelId configurado.`);
      return;
    }

    const channel = await client.channels.fetch(channelId).catch(error => {
      console.log(`[LOG] Erro ao buscar ${label}:`, error.message);
      return null;
    });

    if (!channel) {
      console.log(`[LOG] ${label} não encontrado.`);
      return;
    }

    await channel.send(message);

    console.log(`[LOG] Mensagem enviada para ${label}.`);
  } catch (error) {
    console.error(`[LOG] Erro ao enviar para ${label}:`, error);
  }
}

async function sendPublicLog(client, message) {
  await sendToChannel(
    client,
    process.env.PUBLIC_LOG_CHANNEL_ID,
    message,
    "ganhos"
  );
}

async function sendAdminLog(client, message) {
  await sendToChannel(
    client,
    process.env.ADMIN_LOG_CHANNEL_ID,
    message,
    "admin-logs"
  );
}

async function sendWithdrawLog(client, message) {
  await sendToChannel(
    client,
    process.env.WITHDRAW_CHANNEL_ID,
    message,
    "saques"
  );
}

module.exports = {
  sendPublicLog,
  sendAdminLog,
  sendWithdrawLog
};