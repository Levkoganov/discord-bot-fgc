const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");

// Functions and imports
const saveChampion = require("../functions/saveChampion");
const manageRole = require("../functions/manageRole");
const updateChampionsChannel = require("../functions/updateChampionsChannel");
const championsChannelData = require("../functions/championsChannelData");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-champion")
    .setDescription("set king of the hill champion")

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
          name: "DNF Duel",
          value: "DNF_Duel",
        })
        .addChoices({
          name: "Tekken7",
          value: "Tekken7",
        })
        .addChoices({
          name: "Guilty Gear Xrd Rev 2",
          value: "Guilty_Gear_Xrd_Rev_2",
        })
        .addChoices({
          name: "BlazBlue CF",
          value: "BlazBlue_CF",
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
    try {
      // Server and Channel info
      const guiildInfo = interaction.guild; // Guild info
      const championChannelInfo = {};
      let championChannelData = championChannelInfo[guiildInfo.id]; // Guild id as key

      // Input info
      const game = interaction.options.getString("game"); // Game name
      const selectedUser = interaction.options.getMember("champion");

      // Roles
      const championRoleName = "KOTH - Champion";
      const moderatorsRoleName = "Moderators";
      const ownerId = "237689655317889026";
      const selectedOwnerId = selectedUser.user.id;

      let hasChampionRole = false;
      let roleOutPutResult = ``;
      const hasModRole = interaction.member.roles.cache.some(
        (role) => role.name === moderatorsRoleName
      );

      // Check if user is mod or admin
      if (
        interaction.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        ) ||
        hasModRole ||
        selectedOwnerId === ownerId
      ) {
        // Return array of prev champion
        const previousChampData = await saveChampion(
          selectedUser.user.username,
          selectedUser.user.id,
          game
        );

        // Check if there was a champion
        if (previousChampData.length > 0) {
          // Role assignment
          hasChampionRole = await manageRole(
            interaction,
            previousChampData[0].userId,
            selectedUser,
            championRoleName
          );
          roleOutPutResult = `${
            hasChampionRole
              ? ""
              : 'champion DID NOT get role! make sure "KOTH - Champion" rolename exist.'
          }`;

          const championChannel = await championsChannelData(
            interaction,
            guiildInfo.id
          );

          // Check if channel set.
          if (!championChannel) {
            return await interaction.reply({
              content: `champion is set.\nchampion channel IS NOT set!\n${roleOutPutResult}`,
              ephemeral: true,
            });
          } else {
            // set data for channel
            championChannelData = championChannelInfo[guiildInfo.id] =
              championChannel;

            // Check if bot have permissions
            if (
              interaction.guild.members.me
                .permissionsIn(championChannel)
                .has(
                  PermissionsBitField.Flags.ViewChannel &&
                    PermissionsBitField.Flags.SendMessages
                )
            ) {
              await updateChampionsChannel(championChannelData);
            } else {
              return await interaction.reply({
                content: `champion is set.\nbot doesn't have a permission for "${championChannel.name}" channel\n${roleOutPutResult}`,
                ephemeral: true,
              });
            }
          }

          // Return successful reply
          return await interaction.reply({
            content: `champion is set.\n${roleOutPutResult}`,
            ephemeral: true,
          });

          // If there was no champion
        } else {
          const role = interaction.guild.roles.cache.find(
            (role) => role.name === championRoleName
          ); // Get the role ID
          if (role) {
            hasChampionRole = true;
            await selectedUser.roles.add(role); // Add role to a user
          } else {
            hasChampionRole = false;
          }

          roleOutPutResult = `${
            hasChampionRole
              ? ""
              : 'champion DID NOT get role! make sure "KOTH - Champion" rolename exist.'
          }`;
          const championChannel = await championsChannelData(
            interaction,
            guiildInfo.id
          );

          // Check if channel set.
          if (!championChannel) {
            return await interaction.reply({
              content: `champion is set.\nchampion channel IS NOT set!\n${roleOutPutResult}`,
              ephemeral: true,
            });
          } else {
            // set data for channel
            championChannelData = championChannelInfo[guiildInfo.id] =
              championChannel;

            // Check if bot have permissions
            if (
              interaction.guild.members.me
                .permissionsIn(championChannel)
                .has(
                  PermissionsBitField.Flags.ViewChannel &&
                    PermissionsBitField.Flags.SendMessages
                )
            ) {
              await updateChampionsChannel(championChannelData);
            } else {
              return await interaction.reply({
                content: `champion is set.\nbot doesn't have a permission for "${championChannel.name}" channel\n${roleOutPutResult}`,
                ephemeral: true,
              });
            }
          }

          // Return successful reply
          return await interaction.reply({
            content: `champion is set.\n${roleOutPutResult}`,
            ephemeral: true,
          });
        }

        // User dosen`t have permissions for this command
      } else {
        return interaction.reply({
          content: `Only mods can use this command.`,
          ephemeral: true,
        });
      }
    } catch (err) {
      console.log("setChampion:", err);
    }
  },
};
