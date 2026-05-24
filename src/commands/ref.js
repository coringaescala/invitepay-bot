const {
  SlashCommandBuilder,
  MessageFlags,
  PermissionsBitField
} = require("discord.js");

const prisma = require("../prisma");
const { successEmbed, errorEmbed } = require("../utils/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ref")
    .setDescription("Gerar seu link de referência"),

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
        embeds: [
          successEmbed(
            "🔗 Seu link de referência",
            `Divulgue este link e ganhe por cada membro válido:\n\nhttps://discord.gg/${user.inviteCode}`
          )
        ]
      });
    }

    const channel = interaction.guild.channels.cache.find(c =>
      c.isTextBased() &&
      c.permissionsFor(interaction.guild.members.me)?.has(
        PermissionsBitField.Flags.CreateInstantInvite
      )
    );

    if (!channel) {
      return interaction.editReply({
        embeds: [
          errorEmbed(
            "Erro ao criar convite",
            "Não encontrei um canal onde eu tenha permissão para criar convites."
          )
        ]
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
      embeds: [
        successEmbed(
          "🔗 Link criado com sucesso",
          `Seu link de referência:\n\nhttps://discord.gg/${invite.code}\n\nCada membro válido gera recompensa automaticamente.`
        )
      ]
    });
  }
};