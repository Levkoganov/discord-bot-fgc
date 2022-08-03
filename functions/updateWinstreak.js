const champSchema = require("../models/champion_schema");

async function updateWinstreak(winner, game) {
  try {

    // Find winner data by id
    const winnerData = await champSchema.find({userId: winner.id, game:game});

    // Update winner winstreak
    if (winnerData) {
      await champSchema.findOneAndUpdate(
        { _id: winnerData[0]._id },
        { $inc: { winstreak: 1 } },
        { new: true, upsert: true, useFindAndModify: false }
      );

      return;
    } 
  
  } catch (err) {
    console.log("updateWinstreak:", err);
  }
}

module.exports = updateWinstreak;