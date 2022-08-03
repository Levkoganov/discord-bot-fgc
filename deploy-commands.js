// Node.js system
const fs = require("node:fs");
const path = require("node:path");

// Discord js
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord.js");

// Command deploy function
const deployCommands = () => {
  const commands = []; // Array for command
  const commandsPath = path.join(__dirname, "commands"); // Dirpath to commands
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js")); // Get all commands with .js

  // Loop through all command
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
  }
  // Discord bot token
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  // Invoke appliction guild command
  (async () => {
    console.log("Started refreshing application (/) commands.");
    rest
      .put(
        Routes.applicationGuildCommands(
          process.env.DISCORD_CLIENT_ID,
          process.env.DISCORD_GUILD_ID
        ),
        { body: commands }
      )
      .then(() => console.log("Successfully registered application commands."))
      .catch(console.error);
  })();
};

module.exports = {
  deployCommands,
};
