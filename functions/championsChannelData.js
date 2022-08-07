const championChannelSchema = require("../models/championChannel_schema");

// Get selected channel
async function championsChannelData(interaction, guildId) {
  try {
    // Check if channel exist in server
    const result = await championChannelSchema.findById(guildId);
    if(!result) return;
    const { channelId } = result;

    // Return channel information
    return interaction.guild.channels.cache.get(channelId);

  } catch (error) {
    console.log("championChannelSchema:", error);
  }
}

module.exports = championsChannelData;
