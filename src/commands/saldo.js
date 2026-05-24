const { SlashCommandBuilder } = require("discord.js");
const prisma = require("../prisma");

const {
  infoEmbed,
  errorEmbed
} = require("../utils/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("saldo")
    .setDescription("Ver seu saldo"),

  async execute(interaction) {
    const user = await prisma.user.findUnique({
      where: {
        discordId: interaction.user.id
      }
    });

    if (!user) {
      return interaction.reply({
        embeds: [
          errorEmbed(
            "Conta não encontrada",
            "Você ainda não possui referências. Use `/ref` para gerar seu link."
          )
        ],
        ephemeral: true
      });
    }

    return interaction.reply({
      embeds: [
        infoEmbed(
          "💰 Seu saldo",
          `**Saldo disponível:** R$${user.balance.toFixed(2)}\n**Referências:** ${user.totalReferrals}`
        )
      ],
      ephemeral: true
    });
  }
};