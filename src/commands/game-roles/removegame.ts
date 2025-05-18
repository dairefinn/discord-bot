import {
	InteractionResponseFlags,
	InteractionResponseType,
} from "discord-interactions";
import { Env } from "../..";
import { DiscordRole, fetchRoles } from "../../api/roles";
import {
	DiscordCommandData,
	DiscordCommandOptionType,
	DiscordCommandType,
	DiscordInteraction,
	DiscordInteractionResponse,
	DiscordMember,
} from "../../types/discord";
import { fetchMember, removeMemberRole } from "../../api/members";
import { requireStringOption } from "../../helpers/command-validators";
import { MessageResponseError } from "../../types/errors";

export const data: DiscordCommandData = {
	name: "removegame",
	description: "Remove a game role from yourself",
	type: DiscordCommandType.CHAT_INPUT,
	options: [
		{
			name: "name",
			description: "The name of the game to remove",
			type: DiscordCommandOptionType.STRING,
			required: true,
			autocomplete: true,
		},
	],
};

// Autocomplete handler for suggesting roles ending with "players"
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

	const roleName = `${name} players`;
	const existingRole = roles.find(
		(role) => role.name.toLowerCase() === roleName.toLowerCase()
	);

	if (!existingRole) {
		throw new MessageResponseError(`The role "${roleName}" does not exist.`);
	}

	if (!member.roles.includes(existingRole.id)) {
		throw new MessageResponseError(`You don't have the role for "${name}".`);
	}

	await removeMemberRole(
		env,
		interaction.guild_id,
		member.user.id,
		existingRole.id
	);

	return {
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: `You've been removed from the "${roleName}" role.`,
			flags: InteractionResponseFlags.EPHEMERAL,
		},
	};
}
