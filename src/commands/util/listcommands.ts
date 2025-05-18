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
import { getCommands } from "../../api/commands";

export const data: DiscordCommandData = {
	name: "listcommands",
	description: "List all existing registered commands",
	type: DiscordCommandType.CHAT_INPUT,
};

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

	const found: DiscordCommandData[] = [];

	const existingCommands = await getCommands(env);

	for (const command of existingCommands) {
		found.push(command);
	}

	return {
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: `
                Listed comands:
                \`\`\`${found.map((r) => r.name).join(",\n")}\`\`\`
                `,
			flags: InteractionResponseFlags.EPHEMERAL,
		},
	};
}
