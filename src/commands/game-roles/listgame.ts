import {
	InteractionResponseFlags,
	InteractionResponseType,
} from "discord-interactions";
import { Env } from "../../types/env";
import {
	DiscordCommandData,
	DiscordCommandOptionType,
	DiscordCommandType,
	DiscordInteraction,
	DiscordInteractionResponse,
} from "../../types/discord";
import { DiscordRole, fetchRoles } from "../../api/roles";
import { fetchGuildMembers } from "../../api/members";
import { formatGameName } from "../../helpers/game-roles";
import { buildBulletMentionListContent } from "../../helpers/member-mention-list";
import { requireStringOption } from "../../helpers/command-validators";
import { MessageResponseError } from "../../types/errors";

export const data: DiscordCommandData = {
	name: "listgame",
	description: "List all members who have a game role",
	type: DiscordCommandType.CHAT_INPUT,
	options: [
		{
			name: "name",
			description: "Name of the game",
			type: DiscordCommandOptionType.STRING,
			required: true,
			autocomplete: true,
		},
	],
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
			const q = focusedValue.toLowerCase();
			roleOptions = roleOptions.filter((role) => {
				const short = formatGameName(role).toLowerCase();
				return role.name.toLowerCase().includes(q) || short.includes(q);
			});
			roleOptions.sort((a, b) => {
				const shortA = formatGameName(a).toLowerCase();
				const shortB = formatGameName(b).toLowerCase();
				const aStarts = shortA.startsWith(q) ? 0 : 1;
				const bStarts = shortB.startsWith(q) ? 0 : 1;
				if (aStarts !== bStarts) return aStarts - bStarts;
				return shortA.localeCompare(shortB);
			});
		} else {
			roleOptions.sort((a, b) =>
				formatGameName(a)
					.toLowerCase()
					.localeCompare(formatGameName(b).toLowerCase())
			);
		}

		const choices = roleOptions.map((r) => {
			const short = formatGameName(r);
			return { name: short, value: short };
		});

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
	const name = await requireStringOption(
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

	const members = await fetchGuildMembers(env, interaction.guild_id);
	const withRole = members.filter((m) => m.roles.includes(existingRole.id));

	const gameLabel = formatGameName(existingRole);

	if (withRole.length === 0) {
		return {
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: `**${gameLabel}**\n\nNo one has this role yet.`,
				flags: InteractionResponseFlags.EPHEMERAL,
			},
		};
	}

	const { content, allowed_mentions } = buildBulletMentionListContent(
		gameLabel,
		withRole
	);

	return {
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content,
			flags: InteractionResponseFlags.EPHEMERAL,
			allowed_mentions,
		},
	};
}
