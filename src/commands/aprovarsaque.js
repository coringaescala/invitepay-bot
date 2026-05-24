const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const prisma = require("../prisma");

const {
  sendWithdrawLog,
  sendAdminLog
} = require("../utils/log");

module.exports = {

  data: new SlashCommandBuilder()
    .setName("aprovarsaque")
    .setDescription("Aprovar um saque")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    )
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("ID do saque")
        .setRequired(true)
    ),

  async execute(interaction) {

    const id = interaction.options.getString("id");

    const withdrawal = await prisma.withdrawal.findUnique({
      where: {
        id
      },
      include: {
        user: true
      }
    });

    if (!withdrawal) {

      return interaction.reply({
        content: "Saque não encontrado.",
        ephemeral: true
      });

    }

    if (withdrawal.status === "PAID") {

      return interaction.reply({
        content: "Esse saque já foi aprovado.",
        ephemeral: true
      });

    }

    await prisma.withdrawal.update({
      where: {
        id
      },
      data: {
        status: "PAID",
        paidAt: new Date()
      }
    });

    await sendWithdrawLog(
      interaction.client,
`✅ ${withdrawal.user.username} recebeu R$${withdrawal.amount.toFixed(2)} via Pix!`
    );

    await sendAdminLog(
      interaction.client,
`💰 Saque aprovado

👤 Usuário: ${withdrawal.user.username}
💵 Valor: R$${withdrawal.amount.toFixed(2)}
📌 ID: ${withdrawal.id}`
    );

    return interaction.reply({
      content:
`✅ Saque aprovado com sucesso.

👤 ${withdrawal.user.username}
💰 R$${withdrawal.amount.toFixed(2)}`,
      ephemeral: true
    });

  }

};