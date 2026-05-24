const { EmbedBuilder } = require("discord.js");

const FOOTER = "InvitePay • Sistema de Afiliados";

function baseEmbed(color, title, description) {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: FOOTER })
    .setTimestamp();
}

function successEmbed(title, description) {
  return baseEmbed(0x22c55e, title, description);
}

function errorEmbed(title, description) {
  return baseEmbed(0xef4444, title, description);
}

function infoEmbed(title, description) {
  return baseEmbed(0x3b82f6, title, description);
}

function moneyEmbed(title, description) {
  return baseEmbed(0xfacc15, title, description);
}

function referralEmbed(inviter, member, reward, balance, refs) {
  return new EmbedBuilder()
    .setColor(0x22c55e)
    .setTitle("🎉 Nova referência válida!")
    .setDescription(
      `**${inviter}** trouxe **${member}** para o servidor.\n\n` +
      `💰 **Recompensa:** R$${reward.toFixed(2)}\n` +
      `💼 **Saldo atual:** R$${balance.toFixed(2)}\n` +
      `👥 **Referências totais:** ${refs}`
    )
    .setFooter({ text: FOOTER })
    .setTimestamp();
}

function withdrawalEmbed(username, amount, status = "em análise") {
  return new EmbedBuilder()
    .setColor(0xfacc15)
    .setTitle("💸 Novo saque solicitado")
    .setDescription(
      `**${username}** solicitou um saque.\n\n` +
      `💰 **Valor:** R$${amount.toFixed(2)}\n` +
      `⏳ **Status:** ${status}`
    )
    .setFooter({ text: FOOTER })
    .setTimestamp();
}

function withdrawalPaidEmbed(username, amount) {
  return new EmbedBuilder()
    .setColor(0x22c55e)
    .setTitle("✅ Saque aprovado!")
    .setDescription(
      `**${username}** recebeu seu pagamento via Pix.\n\n` +
      `💰 **Valor pago:** R$${amount.toFixed(2)}`
    )
    .setFooter({ text: FOOTER })
    .setTimestamp();
}

function rankingEmbed(users) {
  const ranking = users.length
    ? users.map((u, i) => {
        const medals = ["🥇", "🥈", "🥉"];
        const medal = medals[i] || `#${i + 1}`;
        return `${medal} **${u.username}** — R$${u.balance.toFixed(2)} | ${u.totalReferrals} refs`;
      }).join("\n")
    : "Ainda não há afiliados no ranking.";

  return new EmbedBuilder()
    .setColor(0xfacc15)
    .setTitle("🏆 TOP AFILIADOS")
    .setDescription(`${ranking}\n\n🔥 Convide amigos e suba no ranking!`)
    .setFooter({ text: FOOTER })
    .setTimestamp();
}

function profileEmbed(user, position) {
  return new EmbedBuilder()
    .setColor(0x3b82f6)
    .setTitle(`👤 Perfil de ${user.username}`)
    .setDescription(
      `💰 **Saldo:** R$${user.balance.toFixed(2)}\n` +
      `👥 **Referências:** ${user.totalReferrals}\n` +
      `🏆 **Ranking:** #${position || "N/A"}`
    )
    .setFooter({ text: FOOTER })
    .setTimestamp();
}

module.exports = {
  successEmbed,
  errorEmbed,
  infoEmbed,
  moneyEmbed,
  referralEmbed,
  withdrawalEmbed,
  withdrawalPaidEmbed,
  rankingEmbed,
  profileEmbed
};