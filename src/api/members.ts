import { Env } from "../types/env";
import { DiscordMember } from "../types/discord";
import { CodeBlockError, MessageResponseError } from "../types/errors";
import { assertResponseOk } from "./utils";

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

	await assertResponseOk(addRoleResponse, "add role to member");
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

	await assertResponseOk(removeRoleResponse, "remove role from member");
}
