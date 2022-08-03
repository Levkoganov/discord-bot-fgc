// Node.js system
const fs = require("node:fs");
const path = require("node:path");

// Dependencies and functions
const { deployCommands } = require("./deploy-commands");
const db_connection = require('./config/mongo_connection');
require("dotenv").config(); // .env variables

// Require the necessary discord.js classes
const { Client, Collection, GatewayIntentBits } = require("discord.js");

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands"); // dirpath to commands
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js")); // get all commands with .js

// Loop through all in command
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

// When the client is ready, run this code (only once)
client.once("ready", () => {
  db_connection(process.env.MONGODB_URI);
  deployCommands();
});

// Interaction Listener
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  // Get interaction command name
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    // Execure command
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
