import type { Command } from "../commands";
import type { DiscordCommandData } from "../types/discord";
import { SYNC_COMMAND_NAME } from "../constants/sync-command";

/** Guild-scoped slash commands only (`/synccommands` is registered globally). */
export function guildSlashCommandsPayload(
	commandMap: Record<string, Command>
): DiscordCommandData[] {
	return Object.values(commandMap)
		.filter((cmd) => cmd.data.name !== SYNC_COMMAND_NAME)
		.map((cmd) => cmd.data);
}
