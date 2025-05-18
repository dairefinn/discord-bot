import { Env } from "..";
import { DiscordMember } from "../types/discord";
import { CodeBlockError, MessageResponseError } from "../types/errors";

export async function fetchMember(
	env: Env,
	guildId: string,
	memberId: string
): Promise<DiscordMember> {
	let member: DiscordMember | null = null;

	try {
		const memberResponse = await fetch(
			`https://discord.com/api/v10/guilds/${guildId}/members/${memberId}`,
			{
				headers: {
					Authorization: `Bot ${env.DISCORD_TOKEN}`,
				},
			}
		);

		member = await memberResponse.json();
	} catch (error) {
		if (error instanceof Error) {
			throw new CodeBlockError(
				"Error fetching member information:",
				error.stack || error.message
			);
		}

		throw error;
	}

	if (!member) {
		throw new MessageResponseError("Could not fetch member information.");
	}

	return member;
}

export async function addMemberRole(
	env: Env,
	guildId: string,
	memberId: string,
	roleId: string
): Promise<void> {
	let addRoleResponse: Response;
	try {
		addRoleResponse = await fetch(
			`https://discord.com/api/v10/guilds/${guildId}/members/${memberId}/roles/${roleId}`,
			{
				method: "PUT",
				headers: {
					Authorization: `Bot ${env.DISCORD_TOKEN}`,
				},
			}
		);
	} catch (error) {
		if (error instanceof Error) {
			throw new CodeBlockError(
				"Error adding role to member:",
				error.stack || error.message
			);
		}

		throw error;
	}

	if (!addRoleResponse.ok) {
		const body = await addRoleResponse.json();
		throw new CodeBlockError(
			"Failed to add the role. Please try again later.",
			JSON.stringify(body)
		);
		// throw new MessageResponseError(
		// 	"Failed to add the role. Please try again later."
		// );
	}
}

export async function removeMemberRole(
	env: Env,
	guildId: string,
	memberId: string,
	roleId: string
): Promise<void> {
	let removeRoleResponse: Response;
	try {
		removeRoleResponse = await fetch(
			`https://discord.com/api/v10/guilds/${guildId}/members/${memberId}/roles/${roleId}`,
			{
				method: "DELETE",
				headers: {
					Authorization: `Bot ${env.DISCORD_TOKEN}`,
				},
			}
		);
	} catch (error) {
		if (error instanceof Error) {
			throw new CodeBlockError(
				"Error adding removing from member:",
				error.stack || error.message
			);
		}

		throw error;
	}

	if (!removeRoleResponse.ok) {
		const body = await removeRoleResponse.json();
		throw new CodeBlockError(
			"Failed to remove the role. Please try again later.",
			JSON.stringify(body)
		);
		// throw new MessageResponseError(
		// 	"Failed to remove the role. Please try again later."
		// );
	}
}
