const { EmbedBuilder } = require("discord.js");

function successEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(0x22c55e)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: "InvitePay • Sistema de Afiliados" })
    .setTimestamp();
}

function errorEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(0xef4444)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: "InvitePay • Sistema de Afiliados" })
    .setTimestamp();
}

function infoEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(0x3b82f6)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: "InvitePay • Sistema de Afiliados" })
    .setTimestamp();
}

function moneyEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(0xfacc15)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: "InvitePay • Pagamentos e Recompensas" })
    .setTimestamp();
}

module.exports = {
  successEmbed,
  errorEmbed,
  infoEmbed,
  moneyEmbed
};