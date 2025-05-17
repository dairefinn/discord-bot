import { DiscordInteraction, DiscordMember, DiscordRole } from '../types/discord';

/**
 * Ensures the interaction is in a guild and returns the guild ID.
 */
export function requireGuild(interaction: DiscordInteraction): string {
  const guildId = interaction.guild_id;
  if (!guildId) {
    throw new Error("You must be in a server to use this command.");
  }

  return guildId;
}

/**
 * Ensures the member has admin permissions.
 */
export async function requireRole(
  guildId: string,
  member: DiscordMember,
  roles: DiscordRole[]
): Promise<boolean> {
  const hasAdmin = member.roles.some(roleId => {
    const role = roles.find(r => r.id === roleId);
    return role && (role.name.toLowerCase() === 'administrator' || role.name.toLowerCase() === 'admin');
  });

  if (!hasAdmin) {
    throw new Error("You must be an admin to use this command.");
  }

  return hasAdmin;
}

/**
 * Ensures the user is a member of the guild and returns the member.
 */
export async function requireMember(
  interaction: DiscordInteraction,
  guildId: string,
  requiredRole?: string
): Promise<DiscordMember> {
  const userId = interaction.member?.user?.id;
  if (!userId) {
    throw new Error("You must be in a server to use this command.");
  }

  // Get member information
  const memberResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
    headers: {
      'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
    }
  });
  const member = await memberResponse.json() as DiscordMember;

  if (!member) {
    throw new Error("You must be in a server to use this command.");
  }

  if (requiredRole) {
    // Fetch guild roles to check permissions
    const rolesResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
      headers: {
        'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
      }
    });
    const roles = await rolesResponse.json() as DiscordRole[];
    await requireRole(guildId, member, roles);
  }

  return member;
}

/**
 * Ensures the parameter is provided in the interaction.
 */
export function requireStringParameter(
  interaction: DiscordInteraction,
  parameter: string,
  errorMessage: string
): string {
  const value = interaction.data?.options?.find(opt => opt.name === parameter)?.value;
  if (!value || typeof value !== 'string') {
    throw new Error(errorMessage);
  }

  return value;
}
