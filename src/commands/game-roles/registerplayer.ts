import { Env } from "../../types/env";
import { DiscordRole, fetchRoles } from "../../api/roles";
import {
	requireAdmin,
	requireStringOption,
} from "../../helpers/command-validators";
import {
	DiscordCommandData,
	DiscordCommandOptionType,
	DiscordCommandType,
	DiscordGuild,
	DiscordInteraction,
	DiscordInteractionResponse,
	DiscordMember,
} from "../../types/discord";
import { fetchGuild } from "../../api/guilds";
import {
	addMemberRole,
	fetchGuildMembers,
	fetchMember,
} from "../../api/members";
import { autocompleteResult, getAutocompleteFocus } from "../../helpers/autocomplete";
import { buildGameRoleAutocompleteChoices } from "../../helpers/game-role-autocomplete";
import {
	findGamePlayersRole,
	formatGameName,
	gamePlayersRoleLabel,
} from "../../helpers/game-roles";
import { ephemeralReply } from "../../helpers/interaction-reply";
import { buildMemberAutocompleteChoices } from "../../helpers/member-autocomplete";
import { parsePlayerIds } from "../../helpers/parse-player-ids";
import { MessageResponseError } from "../../types/errors";

export const data: DiscordCommandData = {
	name: "registerplayer",
	description: "Add players to a game role (admin)",
	type: DiscordCommandType.CHAT_INPUT,
	options: [
		{
			name: "game",
			description: "Game to assign",
			type: DiscordCommandOptionType.STRING,
			required: true,
			autocomplete: true,
		},
		{
			name: "players",
			description:
				"Mentions or IDs; autocomplete picks one. Paste several for bulk.",
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
	const { optionName, value: focusedValue } = getAutocompleteFocus(interaction);

	if (optionName === "game") {
		const roles: DiscordRole[] = await fetchRoles(interaction, env);
		return autocompleteResult(buildGameRoleAutocompleteChoices(focusedValue, roles));
	}

	if (optionName === "players") {
		const gameOption = interaction.data?.options?.find(
			(opt) => opt.name === "game"
		);
		const gameName =
			typeof gameOption?.value === "string" ? gameOption.value.trim() : "";

		const roles: DiscordRole[] = await fetchRoles(interaction, env);
		const excludeRoleId = gameName
			? findGamePlayersRole(roles, gameName)?.id
			: undefined;

		const members: DiscordMember[] = await fetchGuildMembers(
			env,
			interaction.guild_id
		);
		return autocompleteResult(
			buildMemberAutocompleteChoices(focusedValue, members, excludeRoleId)
		);
	}

	return autocompleteResult([]);
}

export async function execute(
	interaction: DiscordInteraction,
	env: Env
): Promise<DiscordInteractionResponse> {
	const guild: DiscordGuild = await fetchGuild(env, interaction.guild_id);
	const caller = await fetchMember(
		env,
		interaction.guild_id,
		interaction.member.user.id
	);
	const gameName = await requireStringOption(
		interaction,
		"game",
		"Game is required."
	);
	const playersRaw = await requireStringOption(
		interaction,
		"players",
		"Players are required."
	);

	const roles: DiscordRole[] = await fetchRoles(interaction, env);
	await requireAdmin(roles, caller, guild);

	const gameRole = findGamePlayersRole(roles, gameName);
	if (!gameRole) {
		const roleName = gamePlayersRoleLabel(gameName);
		throw new MessageResponseError(`The role "${roleName}" does not exist.`);
	}

	const userIds = parsePlayerIds(playersRaw);
	if (userIds.length === 0) {
		throw new MessageResponseError(
			"No valid user mentions or IDs were found. Add at least one user."
		);
	}

	const members: DiscordMember[] = await fetchGuildMembers(
		env,
		interaction.guild_id
	);
	const byId = new Map(members.map((m) => [m.user.id, m]));

	let added = 0;
	let skipped = 0;
	const notInGuild: string[] = [];
	const failures: { id: string; message: string }[] = [];

	for (const userId of userIds) {
		const member = byId.get(userId);
		if (!member) {
			notInGuild.push(userId);
			continue;
		}
		if (member.roles.includes(gameRole.id)) {
			skipped++;
			continue;
		}
		try {
			await addMemberRole(env, interaction.guild_id, userId, gameRole.id);
			added++;
		} catch (e: unknown) {
			const message =
				e instanceof Error ? e.message : "Could not add role to member.";
			failures.push({ id: userId, message });
		}
	}

	const lines: string[] = [
		`**${formatGameName(gameRole)}** — ${added} added, ${skipped} already had the role.`,
	];
	if (notInGuild.length > 0) {
		lines.push(
			`Not in this server (${notInGuild.length}): ${notInGuild
				.map((id) => `\`${id}\``)
				.join(", ")}`
		);
	}
	if (failures.length > 0) {
		lines.push(
			`Failed (${failures.length}):\n${failures
				.map((f) => `- \`${f.id}\`: ${f.message}`)
				.join("\n")}`
		);
	}

	return ephemeralReply(lines.join("\n\n"));
}
