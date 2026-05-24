const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { infoEmbed } = require("../utils/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("painel")
    .setDescription("Abrir painel rápido do sistema de afiliados"),

  async execute(interaction) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("painel_ref")
        .setLabel("Meu Link")
        .setEmoji("🔗")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("painel_saldo")
        .setLabel("Saldo")
        .setEmoji("💰")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("painel_perfil")
        .setLabel("Perfil")
        .setEmoji("👤")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("painel_ranking")
        .setLabel("Ranking")
        .setEmoji("🏆")
        .setStyle(ButtonStyle.Secondary)
    );

    return interaction.reply({
      embeds: [
        infoEmbed(
          "🚀 Painel InvitePay",
          "Use os botões abaixo para acessar rapidamente suas informações."
        )
      ],
      components: [row],
      ephemeral: true
    });
  }
};