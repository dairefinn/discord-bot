import {
	DiscordGuild,
	DiscordInteraction,
	DiscordMember,
} from "../types/discord";
import { DiscordRole } from "../api/roles";
import { MessageResponseError } from "../types/errors";

export async function requireStringOption(
	interaction: DiscordInteraction,
	optionName: string,
	errorMessage: string
): Promise<string> {
	if (!interaction.data) {
		throw new MessageResponseError("No data found in interaction.");
	}

	if (!interaction.data.options || interaction.data.options.length === 0) {
		throw new MessageResponseError("No options found in interaction data.");
	}

	const optionValue = interaction.data.options.find(
		(option) => option.name === optionName
	)?.value;

	if (!optionValue || typeof optionValue !== "string") {
		throw new MessageResponseError(errorMessage);
	}

	return optionValue;
}

export async function requireAdmin(
	roles: DiscordRole[],
	member: DiscordMember,
	guild: DiscordGuild
): Promise<boolean> {
	const userId = member.user?.id;
	const isOwner = guild.owner_id === userId;
	// Check if user has admin role or is owner
	const hasAdmin =
		isOwner ||
		member.roles.some((roleId) => {
			const role = roles.find((r) => r.id === roleId);
			return role && (Number(role.permissions) & 0x8) === 0x8; // Check for ADMINISTRATOR permission flag
		});

	if (!hasAdmin) {
		throw new Error(
			"You must be an administrator or server owner to use this command."
		);
	}

	return hasAdmin;
}
