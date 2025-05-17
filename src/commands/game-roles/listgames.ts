import { InteractionResponseType } from 'discord-interactions';
import { DiscordInteraction, DiscordInteractionResponse, DiscordMember, DiscordRole, FlagEphemeral } from '../../types/discord';

export const data = {
  name: "listgames",
  description: "Get a list of all games you can register for",
  type: 1 // CHAT_INPUT
};

export async function execute(interaction: DiscordInteraction): Promise<DiscordInteractionResponse> {
  console.info("Running the listgames command");
  console.info("User ID: " + interaction.member?.user?.id);
  console.info("Guild ID: " + interaction.guild_id);

  const guildId = interaction.guild_id;
  const userId = interaction.member?.user?.id;

  if (!guildId || !userId) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "You must be in a server to use this command.",
        flags: FlagEphemeral
      }
    };
  }

  // Get member information
  const memberResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
    headers: {
      'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
    }
  });
  const member = await memberResponse.json() as DiscordMember;

  if (!member) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "You must be in a server to use this command.",
        flags: FlagEphemeral
      }
    };
  }

  console.info("All prerequisites checks have passed");

  // Fetch all roles from the guild
  const rolesResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
    headers: {
      'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
    }
  });
  const roles = await rolesResponse.json() as DiscordRole[];

  // Filter roles that end with "players"
  const gameRoles = roles.filter(role => role.name.toLowerCase().endsWith(" players"));

  if (gameRoles.length === 0) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "No games have been registered yet.",
        flags: FlagEphemeral
      }
    };
  }

  // Format the list of games
  const gameList = gameRoles
    .map(role => role.name.replace(/ players$/i, ""))
    .sort()
    .join("\n");

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `**Available Games:**\n${gameList}`,
      flags: FlagEphemeral
    }
  };
}
