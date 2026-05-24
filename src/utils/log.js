async function sendToChannel(client, channelId, message) {

  try {

    const channel = await client.channels.fetch(channelId)
      .catch(() => null);

    if (!channel) return;

    await channel.send(message);

  } catch (error) {

    console.error(error);

  }

}

async function sendPublicLog(client, message) {

  await sendToChannel(
    client,
    process.env.PUBLIC_LOG_CHANNEL_ID,
    message
  );

}

async function sendAdminLog(client, message) {

  await sendToChannel(
    client,
    process.env.ADMIN_LOG_CHANNEL_ID,
    message
  );

}

async function sendWithdrawLog(client, message) {

  await sendToChannel(
    client,
    process.env.WITHDRAW_CHANNEL_ID,
    message
  );

}

module.exports = {
  sendPublicLog,
  sendAdminLog,
  sendWithdrawLog
};