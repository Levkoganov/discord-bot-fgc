const champSchema = require("../models/champion_schema");

async function saveChampion(username, userId ,game) {
  try {
    // Champion data
    const champData = await champSchema.find({ game: game });

    // Check if champion exist
    if (champData.length === 0) {
      await champSchema({
        userId: userId,
        game: game,
        username: username,
        winstreak: 0
      }).save();

      return champData
    } else {

      // Update champion
      await champSchema.findOneAndUpdate(
        { game: game },
        {
          userId: userId,
          game: game,
          username: username,
          winstreak: 0
        },
        { new: true, upsert: true, useFindAndModify: false }
      );

      return champData
    }
  } catch (err) {
    console.log(err);
  }
}

module.exports = saveChampion;
