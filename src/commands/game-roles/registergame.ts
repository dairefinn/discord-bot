import { InteractionResponseType } from 'discord-interactions';
import { DiscordInteraction, DiscordInteractionResponse, DiscordMember, DiscordRole, FlagEphemeral } from '../../types/discord';

export const data = {
  name: "registergame",
  description: "Register a game and create a role for it",
  type: 1, // CHAT_INPUT
  options: [
    {
      name: "name",
      description: "Name of the game to register",
      type: 3, // STRING
      required: true
    }
  ]
};

export async function execute(interaction: DiscordInteraction): Promise<DiscordInteractionResponse> {
  console.info("Running the registergame command");
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

  // Check if the role already exists
  const roleNameLower = roleName.toLowerCase();
  const alreadyExists = roles.some(role => role.name.toLowerCase() === roleNameLower);
  
  if (alreadyExists) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `The role "${roleName}" already exists.`,
        flags: FlagEphemeral
      }
    };
  }

  // Create the role
  try {
    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${process.env.DISCORD_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: roleName,
        color: 0,
        mentionable: true,
        permissions: "0"
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create role');
    }

    const role = await response.json() as DiscordRole;
    console.info(`Role created: ${role.name}`);
  } catch (error) {
    console.error("Error creating role:", error);
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "There was an error creating the role.",
        flags: FlagEphemeral
      }
    };
  }

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `Created role "${roleName}" for game "${game}".`,
      flags: FlagEphemeral
    }
  };
}
