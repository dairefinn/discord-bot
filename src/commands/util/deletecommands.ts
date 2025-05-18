import {
	InteractionResponseFlags,
	InteractionResponseType,
} from "discord-interactions";
import { Env } from "../..";
import { DiscordRole, fetchRoles } from "../../api/roles";
import { requireAdmin } from "../../helpers/command-validators";
import {
	DiscordCommandData,
	DiscordInteraction,
	DiscordInteractionResponse,
	DiscordGuild,
	DiscordCommandType,
} from "../../types/discord";
import { fetchGuild } from "../../api/guilds";
import { fetchMember } from "../../api/members";
import { MessageResponseError } from "../../types/errors";
import { deleteCommand, getCommands } from "../../api/commands";

export const data: DiscordCommandData = {
	name: "deletecommands",
	description: "Delete all existing commands (Except util ones)",
	type: DiscordCommandType.CHAT_INPUT,
};

const BLACKLISTED_COMMANDS = ["deletecommands", "registercommands"];

export async function execute(
	interaction: DiscordInteraction,
	env: Env
): Promise<DiscordInteractionResponse> {
	if (!env.ALLOW_REGISTER_COMMANDS) {
		throw new MessageResponseError("Command reloading is not enabled");
	}

	const guild: DiscordGuild = await fetchGuild(env, interaction.guild_id);
	const member = await fetchMember(
		env,
		interaction.guild_id,
		interaction.member.user.id
	);
	const roles: DiscordRole[] = await fetchRoles(interaction, env);
	requireAdmin(roles, member, guild);

	const removed: DiscordCommandData[] = [];

	const existingCommands = await getCommands(env);

	for (const command of existingCommands) {
		if (BLACKLISTED_COMMANDS.includes(command.name)) {
			continue;
		}

		const commandId: string | undefined = command.id;
		if (!commandId) continue;

		try {
			await deleteCommand(env, commandId);
			removed.push(command);
		} catch (err) {
			console.error(`Failed to delete command ${command.name}:`, err);
		}
	}

	return {
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: `Reloaded commands. Removed: ${removed
				.map((r) => r.name)
				.join(", ")}`,
			flags: InteractionResponseFlags.EPHEMERAL,
		},
	};
}
