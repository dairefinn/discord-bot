import { DiscordRole } from "../api/roles";

/** Strips the `" players"` suffix from a game role name for display and slash options. */
export function formatGameName(role: DiscordRole): string {
	return role.name.replace(/ players$/i, "");
}

/** Full Discord role title for a game short name, e.g. `"Chess" → "Chess players"`. */
export function gamePlayersRoleLabel(gameShortName: string): string {
	return `${gameShortName.trim()} players`;
}

/**
 * Resolves a game display name (e.g. from a slash option) to the corresponding
 * `"{name} players"` role, or `undefined` if none match.
 */
export function findGamePlayersRole(
	roles: DiscordRole[],
	gameShortName: string
): DiscordRole | undefined {
	const trimmed = gameShortName.trim();
	if (!trimmed) {
		return undefined;
	}
	const target = gamePlayersRoleLabel(trimmed).toLowerCase();
	return roles.find((r) => r.name.toLowerCase() === target);
}

/** Guild roles that are game roles (`* players`), sorted by full role name. */
export function getGamePlayerRoles(roles: DiscordRole[]): DiscordRole[] {
	return roles
		.filter((role) => role.name.toLowerCase().endsWith(" players"))
		.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
}
