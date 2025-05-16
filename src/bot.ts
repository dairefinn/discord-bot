import { Client, Collection, Events } from "discord.js";
import { deployCommands } from "./deploy-commands";
import { commands, BotCommand } from "./commands";
import { config } from "./config";
import { replyEphemeral } from "./helpers/response-utils";

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
  // Handle slash commands
  if (interaction.isCommand()) {
    try {
      const { commandName } = interaction;
      if (commands[commandName as keyof typeof commands]) {
        await commands[commandName as keyof typeof commands].execute(
          interaction
        );
      }
    } catch (error: any) {
      console.error("Error in addgame command:", error);
      await replyEphemeral(interaction, error.message || "An error occurred.");
    }
    return;
  }

  // Handle autocomplete interactions
  if (interaction.isAutocomplete()) {
    const { commandName } = interaction;
    if (commands[commandName as keyof typeof commands]) {
      const command = commands[
        commandName as keyof typeof commands
      ] as BotCommand;
      if (command.autocomplete) {
        await command.autocomplete?.(interaction);
      }
    }
    return;
  }
});

client.login(config.DISCORD_TOKEN);
