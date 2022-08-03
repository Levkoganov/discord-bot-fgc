const mongoose = require('mongoose');
const { Schema } = mongoose;

const reqString = {
  type: String,
  require:true,
}

const defaultNumber = {
  type: Number,
  default: 0
}

// Schema for champion
const setChampion = new Schema({
  // guildID: reqString, // Guild ID
  userId: reqString,
  game: reqString, // Game name
  username: reqString, // Username
  winstreak: defaultNumber // Winstreak
},
{ timestamps: true }
);

module.exports = mongoose.model('Champion', setChampion);