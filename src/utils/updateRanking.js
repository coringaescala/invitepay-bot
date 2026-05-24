const prisma = require("../prisma");
const { rankingEmbed } = require("./embeds");

async function updateRanking(client) {
  try {
    const channel = await client.channels.fetch(
      process.env.RANKING_CHANNEL_ID
    ).catch(() => null);

    if (!channel) return;

    const users = await prisma.user.findMany({
      orderBy: {
        balance: "desc"
      },
      take: 10
    });

    const messages = await channel.messages.fetch({
      limit: 10
    });

    const botMessage = messages.find(
      m => m.author.id === client.user.id
    );

    const payload = {
      embeds: [rankingEmbed(users)]
    };

    if (botMessage) {
      await botMessage.edit(payload);
    } else {
      await channel.send(payload);
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  updateRanking
};