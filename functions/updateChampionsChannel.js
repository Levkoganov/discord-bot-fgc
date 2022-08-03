const { AttachmentBuilder } = require("discord.js");

// Functions
const champSchema = require("../models/champion_schema");
const championsEmbed = require("./embeds/championsEmbed");

// Update rank leaderboard
async function updateChampionsChannel(championChannel) {
  try {
    // Main variables
    const channelData = await championChannel.messages.fetch(); // Get channel info
    const allChampions = await champSchema.find();
    const embedData = championsEmbed(allChampions); // Create rank embed

    // Imgs
    const imgFGC = new AttachmentBuilder("./public/img/FGC.png");

    // Check number of message in channel
    if (channelData.size === 0) {
      return championChannel.send({ embeds: [embedData], files: [imgFGC] });
    } else {
      let counter = 0;

      for (const message of channelData) {
        counter++;

        // Edit bot message
        if (message[1].author.bot) {
          message[1].edit({ embeds: [embedData], files: [imgFGC] });
          return;

        // If no bot message send new message
        } else if (!message[1].author.bot && channelData.size === counter) {
          championChannel.send({ embeds: [embedData], files: [imgFGC] });
          return;
        }
      }
    }

  } catch (err) {
    console.log("updateChampionsChannel:", err);
  }
}

module.exports = updateChampionsChannel;
