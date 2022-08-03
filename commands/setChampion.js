const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

// Functions and imports
const saveChampion = require("../functions/saveChampion")
const manageRole = require("../functions/manageRole")
const updateChampionsChannel = require("../functions/updateChampionsChannel")
const championsChannelData = require("../functions/championsChannelData")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set-champion')
		.setDescription('set king of the hill champion')

    // Select game
    .addStringOption((option) =>
      option
        .setName("game")
        .setDescription("Select game")
        .setRequired(true)
        .addChoices({
          name: "Dragonball FighterZ",
          value: "Dragonball_FighterZ",
        })
        .addChoices({
          name: "GG Strive",
          value: "GG_Strive",
        })
        .addChoices({
          name: "MultiVersus",
          value: "MultiVersus",
        })
        .addChoices({
          name: "Brawlhalla",
          value: "Brawlhalla",
        })
        .addChoices({
          name: "DNF Duel",
          value: "DNF_Duel",
        })
        .addChoices({
          name: "Tekken7",
          value: "Tekken7",
        })
        .addChoices({
          name: "Street Fighter V",
          value: "Street_Fighter_V",
        })
    )

    // Select champion
    .addUserOption((option) =>
      option
        .setName("champion")
        .setDescription("select new champion")
        .setRequired(true)
  ),
    
	async execute(interaction) {

    // Server and Channel info
    const guiildInfo = interaction.guild; // Guild info
    const championChannelInfo = {};
    let championChannelData = championChannelInfo[guiildInfo.id]; // Guild id as key

    // Input info
    const game = interaction.options.getString("game"); // Game name
    const selectedUser = interaction.options.getMember('champion')

    // Role IDs
    const championRoleID = "1003647177479958609"
    const ModeratorsRoleID = "1003628964788588585"
    const hasModRole = interaction.member.roles.cache.some((role) => role.id === ModeratorsRoleID);
     
    // Check if user is mod or admin
    if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) || hasModRole) {

      // Return array of prev champion
      const previousChampData = await saveChampion(selectedUser.user.username, selectedUser.user.id, game);

      // Check if there was a champion
      if (previousChampData.length > 0) {
        await manageRole(interaction, previousChampData[0].userId, selectedUser)
        const championChannel = await championsChannelData(interaction, guiildInfo.id);

        // Check if channel set.
        if (!championChannel) {
          return await interaction.reply({content: "champion is set.\nplease set a channel with '/set-channel-champion'.", ephemeral: true});
        } else {
          // set data for channel
          championChannelData = championChannelInfo[guiildInfo.id] = championChannel;

          // Check if bot have permissions
          if (interaction.guild.members.me.permissionsIn(championChannel).has(PermissionsBitField.Flags.ViewChannel && PermissionsBitField.Flags.SendMessages)) {
            await updateChampionsChannel(championChannelData);
          } else {
            return await interaction.reply({content: `champion is set.\nbot doesn't have a permission for "${championChannel.name}" channel`, ephemeral: true});
          }
        }

        return await interaction.reply({content: "champion is set.", ephemeral: true,});

      // If there was no champion
      } else {
        const role = interaction.guild.roles.cache.find(role => role.id === championRoleID); // Get the role ID
        selectedUser.roles.add(role); // Add role to a user

        const championChannel = await championsChannelData(interaction, guiildInfo.id);

        // Check if channel set.
        if (!championChannel) {
          return await interaction.reply({content: "champion is set.\nplease set a channel with '/set-channel-champion'.", ephemeral: true});
        } else {
          // set data for channel
          championChannelData = championChannelInfo[guiildInfo.id] = championChannel;

          // Check if bot have permissions
          if (interaction.guild.members.me.permissionsIn(championChannel).has(PermissionsBitField.Flags.ViewChannel && PermissionsBitField.Flags.SendMessages)) {
            await updateChampionsChannel(championChannelData);
          } else {
            return await interaction.reply({content: `champion is set.\nbot doesn't have a permission for "${championChannel.name}" channel`, ephemeral: true});
          }
        }
        return await interaction.reply({content: "champion is set.", ephemeral: true,});
      }

    // User dosen`t have permissions for this command 
    } else {
        return interaction.reply({
        content: "Only mods can use this command.",
        ephemeral: true,
      });
    }
	},
};