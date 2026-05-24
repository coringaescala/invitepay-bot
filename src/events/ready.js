const invitesCache = require("../invitesCache");

module.exports = {
  name: "clientReady",
  once: true,

  async execute(client) {

    console.log(`Bot online: ${client.user.tag}`);

    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    const invites = await guild.invites.fetch();

    invites.forEach(invite => {
      invitesCache.set(invite.code, invite.uses);
    });

  }
};