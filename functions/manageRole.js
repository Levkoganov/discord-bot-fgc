const champSchema = require("../models/champion_schema");

async function manageRole(interaction, championId, inputMember) {
  try {
    const championRoleName = "KOTH Champion"; // Role id

    // Get Champion data
    const updatedPreviousChampData = await champSchema.find({ userId: championId });
    const role = interaction.guild.roles.cache.find((role) => role.name === championRoleName); // Role info

    // Remove "role" if champion had no other titles
    if (updatedPreviousChampData.length < 1) {
      const member = await interaction.guild.members.fetch(championId);
      member.roles.remove(role);
    }

    inputMember.roles.add(role); // Add role to a user
  } catch (err) {
    console.log(`manageRole err`, err);
  }
}

module.exports = manageRole;
