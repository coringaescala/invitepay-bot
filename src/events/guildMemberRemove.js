const prisma = require("../prisma");

const {
  sendPublicLog,
  sendAdminLog
} = require("../utils/log");

const {
  updateRanking
} = require("../utils/updateRanking");

module.exports = {

  name: "guildMemberRemove",

  async execute(member, client) {

    console.log("Membro saiu:", member.user.tag);

    const referral = await prisma.referral.findUnique({
      where: {
        referredDiscordId: member.user.id
      },
      include: {
        referrer: true
      }
    });

    if (!referral) {

      await sendAdminLog(
        client,
        `📤 ${member.user.tag} saiu do servidor sem referral registrado.`
      );

      return;

    }

    const reward = referral.rewardAmount || 1;

    await prisma.user.update({
      where: {
        id: referral.referrer.id
      },
      data: {
        balance: {
          decrement: reward
        },
        totalReferrals: {
          decrement: 1
        }
      }
    });

    await prisma.referral.delete({
      where: {
        referredDiscordId: member.user.id
      }
    });

    const updatedUser = await prisma.user.findUnique({
      where: {
        id: referral.referrer.id
      }
    });

    await sendPublicLog(
      client,
`📤 ${member.user.username} saiu do servidor.

💸 ${referral.referrer.username} perdeu R$${reward.toFixed(2)}.
👥 Referências atuais: ${updatedUser.totalReferrals}
💰 Novo saldo: R$${updatedUser.balance.toFixed(2)}`
    );

    await sendAdminLog(
      client,
`⚠️ Referral removido

👤 Afiliado: ${referral.referrer.username}
📤 Usuário que saiu: ${member.user.tag}
💸 Valor removido: R$${reward.toFixed(2)}`
    );

    await updateRanking(client);

    console.log(
      `${referral.referrer.username} perdeu R$${reward}`
    );

  }

};