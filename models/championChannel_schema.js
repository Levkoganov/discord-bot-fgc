const mongoose = require('mongoose');
const { Schema } = mongoose;

const reqString = {
  type: String,
  require:true,
}

// Schema for channel
const setGuildChannel = new Schema({
  _id: reqString, // Guild ID
  channelId: reqString,
  channelName: reqString
});

module.exports = mongoose.model('champion-channel', setGuildChannel);