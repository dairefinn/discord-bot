import { InteractionResponseType } from 'discord-interactions';
import { DiscordInteraction, DiscordInteractionResponse, DiscordMember, DiscordRole, FlagEphemeral } from '../../types/discord';

export const data = {
  name: "removegame",
  description: "Remove a game role from yourself",
  type: 1, // CHAT_INPUT
  options: [
    {
      name: "name",
      description: "Name of the game to remove",
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
    const userId = interaction.member?.user?.id;

    if (focusedOption?.name === "name") {
      if (!guildId || !userId) return {
        type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
        data: {
          choices: []
        }
      };

      // Get member information to check their roles
      const memberResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
        headers: {
          'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
        }
      });
      const member = await memberResponse.json() as DiscordMember;

      if (!member) return {
        type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
        data: {
          choices: []
        }
      };

      // Fetch roles from the guild
      const rolesResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
        headers: {
          'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
        }
      });
      const roles = await rolesResponse.json() as DiscordRole[];

      // Filter roles that end with "players" and that the user has
      let roleOptions = roles.filter((role) =>
        role.name.toLowerCase().endsWith(" players") &&
        member.roles.includes(role.id)
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
  console.info("Running the removegame command");
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

  const roleName = `${game} players`;

  // Fetch all roles from the guild
  const rolesResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
    headers: {
      'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
    }
  });
  const roles = await rolesResponse.json() as DiscordRole[];

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

  // Check if user has the role
  if (!member.roles.includes(role.id)) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `You don't have the role "${roleName}".`,
        flags: FlagEphemeral
      }
    };
  }

  // Remove the role from the user
  try {
    await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${role.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
      }
    });
    console.info(`Removed role ${role.name} from user ${userId}`);
  } catch (error) {
    console.error("Error removing role:", error);
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "There was an error removing the role.",
        flags: FlagEphemeral
      }
    };
  }

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `Removed role "${roleName}" for game "${game}".`,
      flags: FlagEphemeral
    }
  };
}
