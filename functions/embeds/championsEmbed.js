const { EmbedBuilder } = require("discord.js");

function championsEmbed(championsData) {

  // Embed messagge
  const embedData = new EmbedBuilder()
    .setColor("#C27C0E")
    .setTitle("\u200B")
    .setAuthor({name: "KOTH Champions",})

    .setImage(`attachment://FGC.png`)
    .setFooter({ text: 'leaderboards last update', iconURL: 'https://i.imgur.com/AfFp7pu.png' })
    .setTimestamp();

    championsData.forEach((data) => {
      embedData.addFields({
        name: `__${data.game}__`,
        value: "```" + `${data.username} ` + `\n` + `Winstreak: ${data.winstreak}` + "```"
      });
    });

    return embedData;
}

module.exports = championsEmbed;
