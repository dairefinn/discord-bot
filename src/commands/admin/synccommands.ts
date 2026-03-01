import {
	InteractionResponseFlags,
	InteractionResponseType,
} from "discord-interactions";
import { Env } from "../../types/env";
import { bulkOverwriteCommands } from "../../api/commands";
import { commands } from "..";
import {
	DiscordCommandData,
	DiscordCommandType,
	DiscordInteraction,
	DiscordInteractionResponse,
} from "../../types/discord";

const ADMINISTRATOR_PERMISSION = "8";

export const data: DiscordCommandData = {
	name: "synccommands",
	description: "Sync all bot commands to this server",
	type: DiscordCommandType.CHAT_INPUT,
	default_member_permissions: ADMINISTRATOR_PERMISSION,
};

export async function execute(
	interaction: DiscordInteraction,
	env: Env
): Promise<DiscordInteractionResponse> {
	const guildId = interaction.guild_id;
	if (!guildId) {
		return {
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: "This command can only be used in a server.",
				flags: InteractionResponseFlags.EPHEMERAL,
			},
		};
	}

	const commandsData = Object.values(commands).map((cmd) => cmd.data);

	try {
		await bulkOverwriteCommands(env, commandsData, guildId);
		return {
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: `Synced ${commandsData.length} commands to this server.`,
				flags: InteractionResponseFlags.EPHEMERAL,
			},
		};
	} catch (err) {
		return {
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: `Failed to sync commands: ${(err as Error).message}`,
				flags: InteractionResponseFlags.EPHEMERAL,
			},
		};
	}
}
