const championChannelSchema = require("../models/championChannel_schema");
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-channel-champion")
    .setDescription("set channel that show all KOTH Champions")

    // Channel name
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("pick channel")
        .setRequired(true)
    ),

  async execute(interaction) {
    const moderatorsRoleName = "Moderators"
    const hasModRole = interaction.member.roles.cache.some((role) => role.name === moderatorsRoleName); // Check if user is mod or admin

    // Check if user is admin or mod
    if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) || hasModRole) {
      // Channel info
      const channel = interaction.options.getChannel("channel");

      // Check for text channel
      if (!channel || channel.type !== 0) {
        return interaction.reply({
          content: "Please tag a text channel.",
          ephemeral: true,
        });
      }

      // Add channel to DB
      const setChannel = await championChannelSchema.findOneAndUpdate(
        { _id: interaction.guild.id },
        {
          _id: interaction.guild.id,
          channelId: channel.id,
          channelName: channel.name,
        },
        { new: true, upsert: true, useFindAndModify: false }
      );

      // Reply if channel is set
      if (setChannel) {
        return interaction.reply({
          content: "Champion channel is set.",
          ephemeral: true,
        });
      }

    } else {
      return interaction.reply({
        content: "You dont have permission for this command...",
        ephemeral: true,
      });
    }

  },
};
