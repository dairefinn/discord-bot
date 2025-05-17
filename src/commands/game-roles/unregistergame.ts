import { InteractionResponseType } from 'discord-interactions';
import { DiscordInteraction, DiscordInteractionResponse, DiscordMember, DiscordRole, FlagEphemeral } from '../../types/discord';

export const data = {
  name: "unregistergame",
  description: "Un-register a game and delete the role for it",
  type: 1, // CHAT_INPUT
  options: [
    {
      name: "name",
      description: "Name of the game to unregister",
      type: 3, // STRING
      required: true,
      autocomplete: true
    }
  ]
};

// Autocomplete handler for suggesting roles ending with "players"
export async function autocomplete(interaction: DiscordInteraction): Promise<DiscordInteractionResponse> {
  try {
    const focusedOption = interaction.data?.options?.find(opt => opt.focused);
    const focusedValue = focusedOption?.value || '';
    const guildId = interaction.guild_id;

    if (focusedOption?.name === "name") {
      if (!guildId) return {
        type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
        data: {
          choices: []
        }
      };

      // Fetch roles from the guild
      const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
        headers: {
          'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
        }
      });
      const roles = await response.json() as DiscordRole[];

      let roleOptions = roles.filter((role) =>
        role.name.toLowerCase().endsWith(" players")
      );

      if (focusedValue && typeof focusedValue === 'string') {
        roleOptions = roleOptions.filter((role) =>
          role.name.toLowerCase().includes(focusedValue.toLowerCase())
        );
      }

      return {
        type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
        data: {
          choices: roleOptions.map((r) => ({
            name: r.name.replace(/ players$/i, ""),
            value: r.name.replace(/ players$/i, "")
          }))
        }
      };
    }

    return {
      type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
      data: {
        choices: []
      }
    };
  } catch (error) {
    console.error("Error in autocomplete:", error);
    return {
      type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
      data: {
        choices: []
      }
    };
  }
}

export async function execute(interaction: DiscordInteraction): Promise<DiscordInteractionResponse> {
  console.info("Running the unregistergame command");
  console.info("User ID: " + interaction.member?.user?.id);
  console.info("Guild ID: " + interaction.guild_id);

  const guildId = interaction.guild_id;
  const userId = interaction.member?.user?.id;
  const game = interaction.data?.options?.find(opt => opt.name === "name")?.value;

  if (!guildId || !userId || !game || typeof game !== 'string') {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "Missing required parameters.",
        flags: FlagEphemeral
      }
    };
  }

  // Check if user has admin permissions
  const memberResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
    headers: {
      'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
    }
  });
  const member = await memberResponse.json() as DiscordMember;

  // Fetch guild roles to check permissions
  const rolesResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
    headers: {
      'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
    }
  });
  const roles = await rolesResponse.json() as DiscordRole[];

  // Check if user has admin role
  const hasAdmin = member.roles.some(roleId => {
    const role = roles.find(r => r.id === roleId);
    return role && (role.name.toLowerCase() === 'administrator' || role.name.toLowerCase() === 'admin');
  });

  if (!hasAdmin) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "You must be an administrator to use this command.",
        flags: FlagEphemeral
      }
    };
  }

  console.info("All prerequisites checks have passed");

  const roleName = `${game} players`;

  // Find the role (case-insensitive)
  const role = roles.find(
    (role) => role.name.toLowerCase() === roleName.toLowerCase()
  );

  if (!role) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `The role "${roleName}" does not exist.`,
        flags: FlagEphemeral
      }
    };
  }

  // Delete the role
  try {
    await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles/${role.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
      }
    });
    console.info(`Role deleted: ${role.name}`);
  } catch (error) {
    console.error("Error deleting role:", error);
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "There was an error deleting the role.",
        flags: FlagEphemeral
      }
    };
  }

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `Deleted role "${roleName}" for game "${game}".`,
      flags: FlagEphemeral
    }
  };
}
