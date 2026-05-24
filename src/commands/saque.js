const { SlashCommandBuilder } = require("discord.js");
const prisma = require("../prisma");

const {
  sendAdminLog,
  sendWithdrawLog
} = require("../utils/log");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("saque")
    .setDescription("Solicitar saque via Pix")
    .addNumberOption(option =>
      option
        .setName("valor")
        .setDescription("Valor do saque")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("pix")
        .setDescription("Sua chave Pix")
        .setRequired(true)
    ),

  async execute(interaction) {
    const amount = interaction.options.getNumber("valor");
    const pixKey = interaction.options.getString("pix");

    if (amount <= 0) {
      return interaction.reply({
        content: "O valor do saque precisa ser maior que zero.",
        ephemeral: true
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        discordId: interaction.user.id
      }
    });

    if (!user) {
      return interaction.reply({
        content: "Você ainda não possui conta de referência. Use /ref primeiro.",
        ephemeral: true
      });
    }

    if (user.balance < amount) {
      return interaction.reply({
        content: `Saldo insuficiente. Seu saldo atual é R$${user.balance.toFixed(2)}.`,
        ephemeral: true
      });
    }

    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: user.id,
        amount,
        pixKey,
        status: "PENDING"
      }
    });

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        balance: {
          decrement: amount
        }
      }
    });

    await sendAdminLog(
      interaction.client,
`💸 Novo saque solicitado

👤 Usuário: ${user.username}
🆔 Discord ID: ${user.discordId}
💰 Valor: R$${amount.toFixed(2)}
🔑 Pix: ${pixKey}
📌 ID do saque: ${withdrawal.id}
💼 Saldo restante: R$${updatedUser.balance.toFixed(2)}`
    );

    await sendWithdrawLog(
      interaction.client,
`💸 ${user.username} solicitou um saque de R$${amount.toFixed(2)}.

⏳ Status: em análise`
    );

    return interaction.reply({
      content:
`✅ Saque solicitado com sucesso!

💰 Valor: R$${amount.toFixed(2)}
📌 ID: ${withdrawal.id}

Aguarde a aprovação da equipe.`,
      ephemeral: true
    });
  }
};