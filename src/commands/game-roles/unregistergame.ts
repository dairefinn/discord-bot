import {
	InteractionResponseFlags,
	InteractionResponseType,
} from "discord-interactions";
import { Env } from "../..";
import {
	DiscordCommandData,
	DiscordCommandOptionType,
	DiscordCommandType,
	DiscordGuild,
	DiscordInteraction,
	DiscordInteractionResponse,
	DiscordMember,
} from "../../types/discord";
import { deleteRole, DiscordRole, fetchRoles } from "../../api/roles";
import {
	requireAdmin,
	requireStringOption,
} from "../../helpers/command-validators";
import { fetchGuild } from "../../api/guilds";
import { fetchMember } from "../../api/members";
import { MessageResponseError } from "../../types/errors";

export const data: DiscordCommandData = {
	name: "unregistergame",
	description: "Unregister a game role",
	type: DiscordCommandType.CHAT_INPUT,
	options: [
		{
			name: "name",
			description: "The name of the game to unregister",
			type: DiscordCommandOptionType.STRING,
			required: true,
			autocomplete: true,
		},
	],
	default_member_permissions: "10000000",
};

export async function autocomplete(
	interaction: DiscordInteraction,
	env: Env
): Promise<DiscordInteractionResponse> {
	const focusedOption = interaction.data?.options?.find((opt) => opt.focused);
	const focusedValue = focusedOption?.value || "";

	if (focusedOption?.name === "name") {
		const roles: DiscordRole[] = await fetchRoles(interaction, env);

		let roleOptions = roles.filter((role) =>
			role.name.toLowerCase().endsWith(" players")
		);

		if (focusedValue && typeof focusedValue === "string") {
			roleOptions = roleOptions.filter((role) =>
				role.name.toLowerCase().includes(focusedValue.toLowerCase())
			);
		}

		const choices = roleOptions.map((r) => ({
			name: r.name.replace(/ players$/i, ""),
			value: r.name.replace(/ players$/i, ""),
		}));

		return {
			type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
			data: {
				choices,
			},
		};
	}

	return {
		type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
		data: {
			choices: [],
		},
	};
}

export async function execute(
	interaction: DiscordInteraction,
	env: Env
): Promise<DiscordInteractionResponse> {
	const guild: DiscordGuild = await fetchGuild(env, interaction.guild_id);
	const member: DiscordMember = await fetchMember(
		env,
		interaction.guild_id,
		interaction.member.user.id
	);
	const name: string = await requireStringOption(
		interaction,
		"name",
		"Game name is required."
	);
	const roles: DiscordRole[] = await fetchRoles(interaction, env);
	requireAdmin(roles, member, guild);

	const roleName = `${name} players`;
	const existingRole = roles.find(
		(role) => role.name.toLowerCase() === roleName.toLowerCase()
	);

	if (!existingRole) {
		throw new MessageResponseError(`No role found for "${name}".`);
	}

	await deleteRole(interaction, env, existingRole.id);

	return {
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: `Deleted "${roleName}" role.`,
			flags: InteractionResponseFlags.EPHEMERAL,
		},
	};
}
