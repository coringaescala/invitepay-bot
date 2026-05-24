const invitesCache = require("../invitesCache");
const prisma = require("../prisma");

module.exports = {
  name: "guildMemberAdd",

  async execute(member) {
    console.log("Novo membro entrou:", member.user.tag);

    if (member.user.bot) return;

    const ageInDays =
      (Date.now() - member.user.createdAt.getTime()) /
      (1000 * 60 * 60 * 24);

    console.log("Idade da conta:", ageInDays);

    if (ageInDays < 30) {
      console.log("Conta com menos de 30 dias.");
      return;
    }

    const invites = await member.guild.invites.fetch();

    console.log("Invites carregados.");

    const usedInvite = invites.find(invite => {
      return invite.uses > (invitesCache.get(invite.code) || 0);
    });

    invites.forEach(invite => {
      invitesCache.set(invite.code, invite.uses);
    });

    if (!usedInvite) {
      console.log("Nenhum invite detectado.");
      return;
    }

    console.log("Invite usado:", usedInvite.code);

    const inviter = await prisma.user.findUnique({
      where: {
        inviteCode: usedInvite.code
      }
    });

    if (!inviter) {
      console.log("Inviter não encontrado no banco pelo inviteCode.");
      return;
    }

    console.log("Inviter encontrado:", inviter.username);

    const alreadyExists = await prisma.referral.findUnique({
      where: {
        referredDiscordId: member.user.id
      }
    });

    if (alreadyExists) {
      console.log("Referral já existe.");
      return;
    }

    await prisma.referral.create({
      data: {
        referrerId: inviter.id,
        referredDiscordId: member.user.id
      }
    });

    await prisma.user.update({
      where: {
        id: inviter.id
      },
      data: {
        balance: {
          increment: 1
        },
        totalReferrals: {
          increment: 1
        }
      }
    });

    console.log(`${inviter.username} ganhou R$1`);
  }
};