const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const prisma = require("../prisma");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addsaldo")
    .setDescription("Adicionar saldo a um usuário")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuário")
        .setRequired(true)
    )
    .addNumberOption(option =>
      option
        .setName("valor")
        .setDescription("Valor para adicionar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("usuario");
    const amount = interaction.options.getNumber("valor");

    const user = await prisma.user.upsert({
      where: {
        discordId: target.id
      },
      update: {
        balance: {
          increment: amount
        }
      },
      create: {
        discordId: target.id,
        username: target.username,
        balance: amount
      }
    });

    await interaction.reply({
      content: `✅ Adicionado R$${amount.toFixed(2)} para ${user.username}.\nSaldo atual: R$${user.balance.toFixed(2)}`,
      ephemeral: true
    });
  }
};