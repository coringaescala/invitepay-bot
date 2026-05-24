require("dotenv").config();

const fs = require("fs");
const path = require("path");

const {
  Client,
  Collection,
  GatewayIntentBits
} = require("discord.js");

const prisma = require("./prisma");

const {
  successEmbed,
  errorEmbed,
  infoEmbed,
  profileEmbed,
  rankingEmbed
} = require("./utils/embeds");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");

if (fs.existsSync(commandsPath)) {
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
  }
}

const eventsPath = path.join(__dirname, "events");

if (fs.existsSync(eventsPath)) {
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter(file => file.endsWith(".js"));

  for (const file of eventFiles) {
    const event = require(`./events/${file}`);

    if (event.once) {
      client.once(event.name, (...args) =>
        event.execute(...args, client)
      );
    } else {
      client.on(event.name, (...args) =>
        event.execute(...args, client)
      );
    }
  }
}

client.on("interactionCreate", async interaction => {
  try {
    if (interaction.isButton()) {
      if (interaction.customId === "painel_ref") {
        const user = await prisma.user.findUnique({
          where: {
            discordId: interaction.user.id
          }
        });

        if (!user || !user.inviteCode) {
          return interaction.reply({
            embeds: [
              errorEmbed(
                "Link não encontrado",
                "Use `/ref` primeiro para gerar seu link."
              )
            ],
            ephemeral: true
          });
        }

        return interaction.reply({
          embeds: [
            successEmbed(
              "🔗 Seu link de referência",
              `Divulgue este link e ganhe por cada membro válido:\n\nhttps://discord.gg/${user.inviteCode}`
            )
          ],
          ephemeral: true
        });
      }

      if (interaction.customId === "painel_saldo") {
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
                "Use `/ref` primeiro."
              )
            ],
            ephemeral: true
          });
        }

        return interaction.reply({
          embeds: [
            infoEmbed(
              "💰 Seu saldo",
              `**Saldo:** R$${user.balance.toFixed(2)}\n**Referências:** ${user.totalReferrals}`
            )
          ],
          ephemeral: true
        });
      }

      if (interaction.customId === "painel_perfil") {
        const user = await prisma.user.findUnique({
          where: {
            discordId: interaction.user.id
          }
        });

        if (!user) {
          return interaction.reply({
            embeds: [
              errorEmbed(
                "Perfil não encontrado",
                "Use `/ref` primeiro."
              )
            ],
            ephemeral: true
          });
        }

        const users = await prisma.user.findMany({
          orderBy: {
            balance: "desc"
          }
        });

        const position =
          users.findIndex(u => u.id === user.id) + 1;

        return interaction.reply({
          embeds: [
            profileEmbed(user, position)
          ],
          ephemeral: true
        });
      }

      if (interaction.customId === "painel_ranking") {
        const users = await prisma.user.findMany({
          orderBy: {
            balance: "desc"
          },
          take: 10
        });

        return interaction.reply({
          embeds: [
            rankingEmbed(users)
          ],
          ephemeral: true
        });
      }

      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    if (interaction.deferred || interaction.replied) {
      return interaction.editReply({
        embeds: [
          errorEmbed(
            "Erro ao executar comando",
            "Ocorreu um erro inesperado. Tente novamente."
          )
        ]
      });
    }

    return interaction.reply({
      embeds: [
        errorEmbed(
          "Erro ao executar comando",
          "Ocorreu um erro inesperado. Tente novamente."
        )
      ],
      ephemeral: true
    });
  }
});

client.login(process.env.DISCORD_TOKEN);