const prisma = require("../prisma");

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

    const ranking = users.map((u, i) => {

      const medals = [
        "🥇",
        "🥈",
        "🥉"
      ];

      const medal = medals[i] || `#${i + 1}`;

      return `${medal} ${u.username} — R$${u.balance.toFixed(2)}`;

    }).join("\n");

    const content =
`🏆 TOP AFILIADOS

${ranking}

🔥 Convide amigos e suba no ranking!`;

    const messages = await channel.messages.fetch({
      limit: 10
    });

    const botMessage = messages.find(
      m => m.author.id === client.user.id
    );

    if (botMessage) {

      await botMessage.edit(content);

    } else {

      await channel.send(content);

    }

  } catch (error) {

    console.error(error);

  }

}

module.exports = {
  updateRanking
};