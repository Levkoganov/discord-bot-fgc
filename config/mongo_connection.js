const mongoose = require("mongoose");

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Connect to mongodb
const db_connection = (URI) => {
  mongoose
    .connect(URI, options)
    .then(() => console.log("Connected to: " + URI))
    .catch((err) => console.log("DATABASE ERROR: " + URI + err));
};

module.exports = db_connection;

