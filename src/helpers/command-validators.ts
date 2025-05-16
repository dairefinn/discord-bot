import {
  Guild,
  GuildMember,
  CommandInteraction,
  CacheType,
  PermissionResolvable,
} from "discord.js";

/**
 * Ensures the interaction is in a guild and returns the guild.
 */
export function requireGuild(
  interaction: CommandInteraction<CacheType>
): Guild {
  const guild = interaction.guild;
  if (!guild) {
    throw new Error("You must be in a server to use this command.");
  }

  return guild;
}

/**
 * Ensures the member has admin permissions.
 */
export function requireRole(
  member: GuildMember,
  roleName: PermissionResolvable
): boolean {
  const isAdmin: boolean = member.permissions.has(roleName);
  if (!isAdmin) {
    throw new Error("You must be an admin to use this command.");
  }

  return isAdmin;
}

/**
 * Ensures the user is a member of the guild and returns the member.
 */
export function requireMember(
  interaction: CommandInteraction<CacheType>,
  guild: Guild,
  requiredRole?: PermissionResolvable
): GuildMember {
  const member = guild.members.cache.get(interaction.user.id);
  if (!member) {
    throw new Error("You must be in a server to use this command.");
  }

  if (requiredRole) {
    requireRole(member, requiredRole);
  }

  return member;
}

/**
 * Ensures the parameter is provided in the interaction.
 */
export function requireStringParameter(
  interaction: CommandInteraction<CacheType>,
  parameter: string,
  errorMessage: string
): string {
  const game = interaction.options.get(parameter)?.value as string;
  if (!game) {
    throw new Error(errorMessage);
  }

  return game;
}
