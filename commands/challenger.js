const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  AttachmentBuilder,
  ButtonStyle,
  PermissionsBitField
} = require("discord.js");

// Functions and imports
const getGameImg = require("../functions/getGameImg");
const matchEmbed = require("../functions/embeds/matchEmbed")
const saveChampion = require("../functions/saveChampion")
const manageRole = require("../functions/manageRole")
const updateWinstreak = require("../functions/updateWinstreak")
const updateChampionsChannel = require("../functions/updateChampionsChannel")
const championsChannelData = require("../functions/championsChannelData")
const champSchema = require("../models/champion_schema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("challenger")
    .setDescription("set your challenger")

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

    .addNumberOption((option) =>
      option
        .setName("rounds")
        .setDescription("select number of rounds")
        .setRequired(true)
        .addChoices({
          name: "First to 3",
          value: 3,
        })
        .addChoices({
          name: "First to 5",
          value: 5,
        })
    )

    // Select champion
    .addUserOption((option) =>
      option
        .setName("challenger")
        .setDescription("select your challenger")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      // General variables
      const game = interaction.options.getString("game");
      const champion = interaction.user; // Champion data
      const challenger = interaction.options.getUser("challenger"); // Challenger data
      const championRoleName = "KOTH - Champion";
      let isCurrentGameChampion = false;

      // Server and Channel info
      const guiildInfo = interaction.guild; // Guild info
      const championChannelInfo = {};
      let championChannelData = championChannelInfo[guiildInfo.id]; // Guild id as key

      const hasRole = interaction.member.roles.cache.some((role) => role.name === championRoleName); // Check if user has role
      const champoinInfo = await champSchema.find({ userId: champion.id });

      // Loop thourh all games
      for (const userGames of champoinInfo) {
        // if game found
        if (userGames.game === game) {
          isCurrentGameChampion = true;
          break;
        }
      }

      // Check if user has role and if user is champ in the selected game
      if (hasRole && isCurrentGameChampion) {
        if (champion.id === challenger.id) {
          return await interaction.reply({ content: "You cannot selecte yourself as a challenger..." , ephemeral: true})
        }

        // general info
        let champion_score = 0; // Champion score
        let challenger_score = 0; // Challenger score
        const rounds = interaction.options.getNumber("rounds"); // Number of rounds

        // Imgs
        const gameImgString = getGameImg(game);
        const gameImg = new AttachmentBuilder(`./public/img/${gameImgString}`);
        const Winneremoji = "<:trophy:988122907815325758>"; // Winner emoji
        
        // Creating new card Embed
        const cardEmbed = matchEmbed(
          champion,
          challenger,
          champion_score,
          challenger_score,
          rounds,
          game,
          gameImgString
        );

        // All buttons
        const row = new ActionRowBuilder()
        // Btn(1)
        .addComponents(
          new ButtonBuilder()
            .setCustomId(champion.username)
            .setLabel(champion.username)
            .setStyle(ButtonStyle.Primary)
        )
        // Btn(2)
        .addComponents(
          new ButtonBuilder()
            .setCustomId(challenger.username)
            .setLabel(challenger.username)
            .setStyle(ButtonStyle.Success)
        )
        // Btn(3)
        .addComponents(
          new ButtonBuilder()
            .setCustomId("Reset")
            .setLabel("RESET 🔄")
            .setStyle(ButtonStyle.Secondary)
        )
        // Btn(4)
        .addComponents(
          new ButtonBuilder()
            .setCustomId("Delete")
            .setLabel("DELETE ❌")
            .setStyle(ButtonStyle.Secondary)
        );

        // Reply interaction
        const rep = await interaction.reply({
          embeds: [cardEmbed],
          components: [row],
          files: [gameImg],
          fetchReply: true,
        });

        // Filter by user click
        const filter = async (i) => {
          // Check users ID
          if (i.user.id === champion.id) return true;

          // Username ID dont match
          await i.reply({
            content: `These buttons aren't for you...`,
            ephemeral: true,
          });
        };

        const collector = rep.createMessageComponentCollector({
          filter,
          max: 99,
          time: (1000 * 60) * 90 // 90min
        });

        collector.on("collect", async (i) => {
          // Champion (BTN1)
          if (i.customId === champion.username) {
            champion_score++; // Increment counter when btn clicked
            let btn1_championUpdate = `**__Champion__ (${champion_score})\n` + "`1`" + `${champion}**`;
            let btn1_challengerUpdate = `*~~__Challenger__ (${challenger_score})\n` + "`2`" + `${challenger}~~*`;

            // Champion win
            if (champion_score === rounds) {
              cardEmbed.data.fields[0].value = btn1_championUpdate; // Winner field
              cardEmbed.data.fields[2].value = btn1_challengerUpdate; // Loser field
              cardEmbed.setTitle(`${Winneremoji}` + "```" + `${champion.username} (${champion_score} - ${challenger_score})` + "```");

              // Update card
              await i.update({
                embeds: [cardEmbed],
                files: [gameImg],
                components: [],
              });

              // Update champion winstreak
              // TODO
              // Check if winstreak updated or not
              await updateWinstreak(champion, game);

              const championChannel = await championsChannelData(interaction, guiildInfo.id);

              // Check if channel set.
              if (!championChannel) {
                await i.editReply({content: "champion channel IS NOT set!"});

              } else {
                // set data for channel
                championChannelData = championChannelInfo[guiildInfo.id] = championChannel;

                // Check if bot have permissions
                if (i.guild.members.me.permissionsIn(championChannel).has(PermissionsBitField.Flags.ViewChannel && PermissionsBitField.Flags.SendMessages)) {
                  await updateChampionsChannel(championChannelData);
                } else {
                  await i.editReply({content: `bot doesn't have a permission for "${championChannel.name}" channel`,});
                }
              }

              // End collector
              collector.stop();
              return;
            }


            // Update Champion embed
            cardEmbed.data.fields[0].value = btn1_championUpdate; // Edit embed field
            await i.update({ embeds: [cardEmbed] });
          }

          // Challenger (BTN2)
          if (i.customId === challenger.username) {
            challenger_score++; // Increment counter when btn clicked
            let btn2_championUpdate = `*~~__Champion__ (${champion_score})~~\n` + "~~`1`" + `${champion}~~*`;
            let btn2_challengerUpdate = `**__Challenger__ (${challenger_score})\n` + "`2`" + `${challenger}**`;

            if (challenger_score === rounds) {
              cardEmbed.data.fields[2].value = btn2_challengerUpdate; // Winner field
              cardEmbed.data.fields[0].value = btn2_championUpdate; // Loser field
              cardEmbed.setTitle(`${Winneremoji}` + "```" + `${challenger.username} (${champion_score} - ${challenger_score})` + "```");

              // Update card
              await i.update({
                embeds: [cardEmbed],
                files: [gameImg],
                components: [],
              });

              // Update Champion
              await saveChampion(challenger.username, challenger.id, game);
              const challengerMember = interaction.options.getMember('challenger') // Challenger member object

              // Role assignment
              let hasChampionRole = await manageRole(interaction, champion.id, challengerMember, championRoleName)
              let roleOutPutResult = `${hasChampionRole ? "" : 'champion DID NOT get role! make sure "KOTH - Champion" rolename exist.'}`

              // Check if champion role exist
              if (!hasChampionRole) {
                await i.editReply({content: `${roleOutPutResult}`});

              } else {
                // Set championChannel
                const championChannel = await championsChannelData(interaction, guiildInfo.id);
  
                // Check if channel set.
                if (!championChannel) {
                  await i.editReply({content: `champion channel IS NOT set!\n${roleOutPutResult}`});
  
                } else {
                  // set data for channel
                  championChannelData = championChannelInfo[guiildInfo.id] = championChannel;
  
                  // Check if bot have permissions
                  if (i.guild.members.me.permissionsIn(championChannel).has(PermissionsBitField.Flags.ViewChannel && PermissionsBitField.Flags.SendMessages)) {
                    await updateChampionsChannel(championChannelData);
                  } else {
                    await i.editReply({content: `bot doesn't have a permission for "${championChannel.name}" channel\n${roleOutPutResult}`,});
                  }
                  
                }
              }

              // End collector
              collector.stop();
              return;
            }

            // Update Challenger embed
            cardEmbed.data.fields[2].value = btn2_challengerUpdate; // Edit embed field
            await i.update({ embeds: [cardEmbed] });
          }

          // Reset card points
          if (i.customId === "Reset") {
            champion_score = 0; // reset p1 score
            challenger_score = 0; // reset p2 score
            let resetChampion = `**__Champion__ (${champion_score})\n` + "`1`" + `${champion}**`;
            let resetChallenger = `**__Challenger__ (${challenger_score})\n` + "`2`" + `${challenger}**`;
            cardEmbed.data.fields[0].value = resetChampion; // Edit embed field
            cardEmbed.data.fields[2].value = resetChallenger; // Player2
            return await i.update({ embeds: [cardEmbed] });
          }

          // Delete bot interaction
          if (i.customId === "Delete") {
            interaction.deleteReply();
            collector.stop()
            return;
          }
        })

        // Listen when end
        collector.on("end", (collected) =>
          console.log(`Collected ${collected.size} items`)
        );

      // User dosen`t have role
      } else {
        return await interaction.reply({
          content: "Only champion can use this command",
          ephemeral: true,
        });
      }
      
    } catch (err) {
      console.log("Challenger", err);
    }
  },
};
