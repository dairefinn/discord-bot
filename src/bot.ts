import { Client } from "discord.js";
import { deployCommands } from "./deploy-commands";
import { commands } from "./commands";
import { config } from "./config";

/**
 * This is the main entry point for the bot.
 */
const client = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages"],
});

// When the bot is ready, log to the console
client.once("ready", () => {
  console.log("Discord bot is ready! 🤖");
});

// When a new guild is created, deploy the commands to it
client.on("guildCreate", async (guild) => {
  await deployCommands({ guildId: guild.id });
});

// When a user interacts with the bot, execute the command
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }
  const { commandName } = interaction;
  if (commands[commandName as keyof typeof commands]) {
    commands[commandName as keyof typeof commands].execute(interaction);
  }
});

client.login(config.DISCORD_TOKEN);