const { EmbedBuilder } = require("discord.js");

function matchEmbed(champion, challenger, champScore, challengerScore, rounds, game, gameImg) {
  const championInfo = `**__Champion__ (${champScore}) \n` +  "`1`" +`${champion}**`; // Champion info
  const challengerInfo = `**__Challenger__ (${challengerScore})\n` + "`2`" + `${challenger}**`; // Challenger info

  // Embed messagge
  return new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle("```Match - first to" + ` ${rounds}` + "```")
    .setAuthor({name: game})
    .addFields([
      {
        name: "\u200B",
        value: championInfo,
        inline: true,
      },

      {
        name: "\u200B",
        value: `***--VS--***`,
        inline: true,
      },

      {
        name: "\u200B",
        value: challengerInfo,
        inline: true,
      }
    ])
    .setImage(`attachment://${gameImg}`)
    .setTimestamp();
}

module.exports = matchEmbed;
