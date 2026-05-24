const invitesCache = require("../invitesCache");
const prisma = require("../prisma");

const {
  sendPublicLog,
  sendAdminLog
} = require("../utils/log");

const {
  updateRanking
} = require("../utils/updateRanking");

const {
  referralEmbed
} = require("../utils/embeds");

module.exports = {
  name: "guildMemberAdd",

  async execute(member, client) {
    console.log("Novo membro entrou:", member.user.tag);

    if (member.user.bot) {
      await sendAdminLog(client, {
        content: `⚠️ Bot ignorado: ${member.user.tag}`
      });
      return;
    }

    const ageInDays =
      (Date.now() - member.user.createdAt.getTime()) /
      (1000 * 60 * 60 * 24);

    if (ageInDays < 0) {
      await sendAdminLog(client, {
        content: `❌ Referral recusado: ${member.user.tag} possui menos de 30 dias.`
      });
      return;
    }

    const invites = await member.guild.invites.fetch();

    const usedInvite = invites.find(invite => {
      return invite.uses > (invitesCache.get(invite.code) || 0);
    });

    invites.forEach(invite => {
      invitesCache.set(invite.code, invite.uses);
    });

    if (!usedInvite) {
      await sendAdminLog(client, {
        content: `❌ Convite não detectado para ${member.user.tag}`
      });
      return;
    }

    const inviter = await prisma.user.findUnique({
      where: {
        inviteCode: usedInvite.code
      }
    });

    if (!inviter) {
      await sendAdminLog(client, {
        content: `❌ Invite ${usedInvite.code} não encontrado no banco`
      });
      return;
    }

    const alreadyExists = await prisma.referral.findUnique({
      where: {
        referredDiscordId: member.user.id
      }
    });

    if (alreadyExists) {
      await sendAdminLog(client, {
        content: `❌ Referral duplicado recusado: ${member.user.tag}`
      });
      return;
    }

    const reward = Number(process.env.REFERRAL_REWARD || 1);

    await prisma.referral.create({
      data: {
        referrerId: inviter.id,
        referredDiscordId: member.user.id,
        referredUsername: member.user.username,
        inviteCode: usedInvite.code,
        rewardAmount: reward
      }
    });

    const updatedUser = await prisma.user.update({
      where: {
        id: inviter.id
      },
      data: {
        balance: {
          increment: reward
        },
        totalReferrals: {
          increment: 1
        }
      }
    });

    await sendPublicLog(client, {
      embeds: [
        referralEmbed(
          inviter.username,
          member.user.username,
          reward,
          updatedUser.balance,
          updatedUser.totalReferrals
        )
      ]
    });

    await sendAdminLog(client, {
      content:
`✅ Referral aprovado

👤 Afiliado: ${inviter.username}
👥 Novo membro: ${member.user.tag}
💰 Recompensa: R$${reward.toFixed(2)}`
    });

    await updateRanking(client);

    console.log(`${inviter.username} ganhou R$${reward}`);
  }
};