import { DiscordRole } from "../api/roles";

/** Strips the `" players"` suffix from a game role name for display and slash options. */
export function formatGameName(role: DiscordRole): string {
	return role.name.replace(/ players$/i, "");
}
