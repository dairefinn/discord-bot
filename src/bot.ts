import { Client, Collection, Events } from "discord.js";
import { deployCommands } from "./deploy-commands";
import { commands } from "./commands";
import { config } from "./config";

/**
 * This is the main entry point for the bot.
 */
const client = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages", "GuildVoiceStates"],
});

// When the bot is ready, log to the console
client.once(Events.ClientReady, () => {
  console.log("Discord bot is ready! 🤖");
  client.guilds.cache.forEach(async (guild) => {
    deployCommands({ guildId: guild.id });
  });
});

// When a new guild is created, deploy the commands to it
client.on(Events.GuildCreate, async (guild) => {
  await deployCommands({ guildId: guild.id });
});


// When a user interacts with the bot, execute the command
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }
  const { commandName } = interaction;
  if (commands[commandName as keyof typeof commands]) {
    commands[commandName as keyof typeof commands].execute(interaction);
  }
});

client.login(config.DISCORD_TOKEN);