const { SlashCommandBuilder } = require("discord.js");
const prisma = require("../prisma");
const { profileEmbed, errorEmbed } = require("../utils/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("perfil")
    .setDescription("Ver seu perfil de afiliado"),

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
            "Perfil não encontrado",
            "Use `/ref` para começar no sistema de afiliados."
          )
        ],
        ephemeral: true
      });
    }

    const users = await prisma.user.findMany({
      orderBy: {
        balance: "desc"
      }
    });

    const position = users.findIndex(u => u.id === user.id) + 1;

    return interaction.reply({
      embeds: [
        profileEmbed(user, position)
      ],
      ephemeral: true
    });
  }
};