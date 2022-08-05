const champSchema = require("../models/champion_schema");

async function manageRole(interaction, championId, inputMember, championRoleName) {
  try {
    // Get Champion data
    const updatedPreviousChampData = await champSchema.find({ userId: championId });
    const role = interaction.guild.roles.cache.find((role) => role.name === championRoleName); // Role info

    if (role) {
      // Remove "role" if champion had no other titles
      if (updatedPreviousChampData.length < 1) {
        const member = await interaction.guild.members.fetch(championId);
        await member.roles.remove(role);
      }

      // Add role to a user
      await inputMember.roles.add(role);
      return true

    } else {
      return false
    }

  } catch (err) {
    console.log(`manageRole err`, err);
  }
}

module.exports = manageRole;
