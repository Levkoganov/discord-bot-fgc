const mongoose = require("mongoose");
const { Schema } = mongoose;

const reqString = {
  type: String,
  require: true,
};

const userTimeLimit = new Schema({
  _id: reqString,
  username: reqString,
  games: [
    {
      gameName: reqString,
      createdAt: reqString,
    },
  ],
});

module.exports = mongoose.model("userTimeLimit", userTimeLimit);
