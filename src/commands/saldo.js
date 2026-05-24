const {
  SlashCommandBuilder
} = require("discord.js");

const prisma = require("../prisma");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("saldo")
    .setDescription("Ver saldo"),

  async execute(interaction) {

    const user = await prisma.user.findUnique({
      where: {
        discordId: interaction.user.id
      }
    });

    if (!user) {
      return interaction.reply({
        content: "Você ainda não possui referrals.",
        ephemeral: true
      });
    }

    await interaction.reply({
      content:
`💰 Saldo: R$${user.balance}

👥 Referências: ${user.totalReferrals}`,
      ephemeral: true
    });
  }
};