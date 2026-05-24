const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const prisma = require("../prisma");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ref")
    .setDescription("Seu link de referência"),

  async execute(interaction) {
    await interaction.deferReply({
      flags: MessageFlags.Ephemeral
    });

    let user = await prisma.user.findUnique({
      where: {
        discordId: interaction.user.id
      }
    });

    if (user && user.inviteCode) {
      return interaction.editReply({
        content: `Seu invite:\nhttps://discord.gg/${user.inviteCode}`
      });
    }

    const channel = interaction.guild.channels.cache.find(c =>
      c.isTextBased() &&
      c.permissionsFor(interaction.guild.members.me).has("CreateInstantInvite")
    );

    if (!channel) {
      return interaction.editReply({
        content: "Não encontrei um canal onde eu possa criar convite. Verifique minhas permissões."
      });
    }

    const invite = await channel.createInvite({
      maxAge: 0,
      maxUses: 0,
      unique: true
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          discordId: interaction.user.id,
          username: interaction.user.username,
          inviteCode: invite.code
        }
      });
    } else {
      user = await prisma.user.update({
        where: {
          discordId: interaction.user.id
        },
        data: {
          inviteCode: invite.code
        }
      });
    }

    return interaction.editReply({
      content: `Seu invite:\nhttps://discord.gg/${invite.code}`
    });
  }
};