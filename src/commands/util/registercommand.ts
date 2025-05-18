import {
	InteractionResponseFlags,
	InteractionResponseType,
} from "discord-interactions";
import { Env } from "../..";
import { DiscordRole, fetchRoles } from "../../api/roles";
import {
	requireAdmin,
	requireStringOption,
} from "../../helpers/command-validators";
import {
	DiscordCommandData,
	DiscordInteraction,
	DiscordInteractionResponse,
	DiscordGuild,
	DiscordCommandType,
	DiscordCommandOptionType,
} from "../../types/discord";
import { fetchGuild } from "../../api/guilds";
import { fetchMember } from "../../api/members";
import { MessageResponseError } from "../../types/errors";
import { registerCommand } from "../../api/commands";
import { commands } from "..";

export const data: DiscordCommandData = {
	name: "registercommand",
	description: "Registers a command",
	type: DiscordCommandType.CHAT_INPUT,
	options: [
		{
			name: "name",
			description: "Name of the game to add",
			type: DiscordCommandOptionType.STRING,
			required: true,
		},
	],
	// default_member_permissions: "0x0000000010000000",
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
	const name: string = await requireStringOption(
		interaction,
		"name",
		"Command name is required."
	);

	const added: DiscordCommandData[] = [];

	for (const command of Object.values(commands)) {
		if (BLACKLISTED_COMMANDS.includes(command.data.name)) {
			continue;
		}

		if (command.data.name !== name) {
			continue;
		}

		try {
			await registerCommand(env, command.data);
			added.push(command.data);
		} catch (err) {
			console.error(`Failed to register command ${command.data.name}:`, err);
		}
	}

	if (added.length === 0) {
		return {
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: `No commands were added.`,
				flags: InteractionResponseFlags.EPHEMERAL,
			},
		};
	}

	return {
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: `Reloaded commands. Added: ${added
				.map((a) => a.name)
				.join(", ")}`,
			flags: InteractionResponseFlags.EPHEMERAL,
		},
	};
}
