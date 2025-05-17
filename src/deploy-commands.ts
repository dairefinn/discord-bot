import { config } from "./config";
import { commands } from "./commands";

/**
 * This will deploy the commands to the Discord API so that they can be used.
 * It should be run once after the bot is invited to a server.
 */

const commandsData = Object.values(commands).map((command) => command.data);

type DeployCommandsProps = {
  guildId: string;
};

export async function deployCommands({ guildId }: DeployCommandsProps) {
  try {
    console.log("Started refreshing application (/) commands.");

    const response = await fetch(
      `https://discord.com/api/v10/applications/${config.DISCORD_APPLICATION_ID}/guilds/${guildId}/commands`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bot ${config.DISCORD_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commandsData)
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to deploy commands: ${response.statusText}`);
    }

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}
