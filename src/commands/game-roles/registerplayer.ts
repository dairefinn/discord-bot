import {
	InteractionResponseFlags,
	InteractionResponseType,
} from "discord-interactions";
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
import { formatGameName } from "../../helpers/game-roles";
import { parsePlayerIds } from "../../helpers/parse-player-ids";
import { memberDisplayName } from "../../helpers/member-mention-list";
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

function autocompleteGame(
	focusedValue: string,
	roles: DiscordRole[]
): { name: string; value: string }[] {
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

	return roleOptions.map((r) => {
		const short = formatGameName(r);
		return { name: short, value: short };
	});
}

function memberMatchesQuery(member: DiscordMember, q: string): boolean {
	const id = member.user.id.toLowerCase();
	const username = (member.user.username || "").toLowerCase();
	const display = memberDisplayName(member).toLowerCase();
	return id.includes(q) || username.includes(q) || display.includes(q);
}

function autocompletePlayers(
	focusedValue: string,
	members: DiscordMember[],
	excludeRoleId?: string
): { name: string; value: string }[] {
	const q =
		focusedValue && typeof focusedValue === "string"
			? focusedValue.trim().toLowerCase()
			: "";

	let list = members;
	if (excludeRoleId) {
		list = list.filter((m) => !m.roles.includes(excludeRoleId));
	}
	if (q) {
		list = list.filter((m) => memberMatchesQuery(m, q));
		list.sort((a, b) => {
			const nameA = memberDisplayName(a).toLowerCase();
			const nameB = memberDisplayName(b).toLowerCase();
			const aStarts = nameA.startsWith(q) ? 0 : 1;
			const bStarts = nameB.startsWith(q) ? 0 : 1;
			if (aStarts !== bStarts) return aStarts - bStarts;
			return nameA.localeCompare(nameB);
		});
	} else {
		list = [...list].sort((a, b) =>
			memberDisplayName(a)
				.toLowerCase()
				.localeCompare(memberDisplayName(b).toLowerCase())
		);
	}

	return list.map((m) => {
		const display = memberDisplayName(m);
		const handle = m.user.username || m.user.id;
		const name =
			display.toLowerCase() === handle.toLowerCase()
				? display
				: `${display} (@${handle})`;
		return { name, value: m.user.id };
	});
}

export async function autocomplete(
	interaction: DiscordInteraction,
	env: Env
): Promise<DiscordInteractionResponse> {
	const focusedOption = interaction.data?.options?.find((opt) => opt.focused);
	const focusedValue =
		(typeof focusedOption?.value === "string" ? focusedOption.value : "") || "";

	if (focusedOption?.name === "game") {
		const roles: DiscordRole[] = await fetchRoles(interaction, env);
		return {
			type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
			data: {
				choices: autocompleteGame(focusedValue, roles),
			},
		};
	}

	if (focusedOption?.name === "players") {
		const gameOption = interaction.data?.options?.find(
			(opt) => opt.name === "game"
		);
		const gameName =
			typeof gameOption?.value === "string" ? gameOption.value.trim() : "";

		const roles: DiscordRole[] = await fetchRoles(interaction, env);
		let excludeRoleId: string | undefined;
		if (gameName) {
			const roleName = `${gameName} players`;
			const gameRole = roles.find(
				(r) => r.name.toLowerCase() === roleName.toLowerCase()
			);
			if (gameRole) {
				excludeRoleId = gameRole.id;
			}
		}

		const members = await fetchGuildMembers(env, interaction.guild_id);
		return {
			type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
			data: {
				choices: autocompletePlayers(focusedValue, members, excludeRoleId),
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

	const roleName = `${gameName} players`;
	const gameRole = roles.find(
		(role) => role.name.toLowerCase() === roleName.toLowerCase()
	);

	if (!gameRole) {
		throw new MessageResponseError(`The role "${roleName}" does not exist.`);
	}

	const userIds = parsePlayerIds(playersRaw);
	if (userIds.length === 0) {
		throw new MessageResponseError(
			"No valid user mentions or IDs were found. Add at least one user."
		);
	}

	const members = await fetchGuildMembers(env, interaction.guild_id);
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
		`**${formatGameName(
			gameRole
		)}** — ${added} added, ${skipped} already had the role.`,
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

	return {
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: lines.join("\n\n"),
			flags: InteractionResponseFlags.EPHEMERAL,
		},
	};
}
