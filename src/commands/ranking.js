const {
  SlashCommandBuilder
} = require("discord.js");

const prisma = require("../prisma");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ranking")
    .setDescription("Top referências"),

  async execute(interaction) {

    const users = await prisma.user.findMany({
      orderBy: {
        totalReferrals: "desc"
      },
      take: 10
    });

    const ranking = users.map((u, i) => {
      return `${i + 1}. ${u.username} - ${u.totalReferrals}`;
    });

    await interaction.reply({
      content:
`🏆 Ranking

${ranking.join("\n")}`
    });
  }
};