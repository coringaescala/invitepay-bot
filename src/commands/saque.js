const { SlashCommandBuilder } = require("discord.js");
const prisma = require("../prisma");

const {
  sendAdminLog,
  sendWithdrawLog
} = require("../utils/log");

const {
  successEmbed,
  errorEmbed,
  withdrawalEmbed
} = require("../utils/embeds");

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

    if (amount < 10) {
      return interaction.reply({
        embeds: [
          errorEmbed(
            "Valor mínimo não atingido",
            "O valor mínimo para saque é **R$10,00**."
          )
        ],
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
        embeds: [
          errorEmbed(
            "Conta não encontrada",
            "Use `/ref` primeiro para participar do sistema de afiliados."
          )
        ],
        ephemeral: true
      });
    }

    if (user.balance < amount) {
      return interaction.reply({
        embeds: [
          errorEmbed(
            "Saldo insuficiente",
            `Seu saldo atual é **R$${user.balance.toFixed(2)}**.`
          )
        ],
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

    await sendAdminLog(interaction.client, {
      content:
`💸 Novo saque solicitado

👤 Usuário: ${user.username}
🆔 Discord ID: ${user.discordId}
💰 Valor: R$${amount.toFixed(2)}
🔑 Pix: ${pixKey}
📌 ID do saque: ${withdrawal.id}
💼 Saldo restante: R$${updatedUser.balance.toFixed(2)}`
    });

    await sendWithdrawLog(interaction.client, {
      embeds: [
        withdrawalEmbed(user.username, amount)
      ]
    });

    return interaction.reply({
      embeds: [
        successEmbed(
          "✅ Saque solicitado com sucesso",
          `💰 **Valor:** R$${amount.toFixed(2)}\n📌 **ID:** ${withdrawal.id}\n\nAguarde a aprovação da equipe.`
        )
      ],
      ephemeral: true
    });
  }
};