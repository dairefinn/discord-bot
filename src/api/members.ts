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

const GUILD_MEMBERS_PAGE_LIMIT = 1000;

const MISSING_ACCESS_CODE = 50001;

function handleListMembersFailure(
	_response: Response,
	errorBody: unknown
): never {
	const code =
		errorBody &&
		typeof errorBody === "object" &&
		"code" in errorBody &&
		typeof (errorBody as { code: unknown }).code === "number"
			? (errorBody as { code: number }).code
			: undefined;

	if (code === MISSING_ACCESS_CODE) {
		throw new MessageResponseError(
			"This bot cannot list server members. In the Discord Developer Portal, open your application → Bot → enable **Server Members Intent** under Privileged Gateway Intents, save, then redeploy or restart the worker so the new intent applies."
		);
	}

	throw new CodeBlockError(
		"Failed to fetch guild members:",
		JSON.stringify(errorBody)
	);
}

/**
 * Fetches all guild members via the List Guild Members endpoint (paginated).
 * Requires the Server Members privileged intent (Developer Portal → Bot).
 */
export async function fetchGuildMembers(
	env: Env,
	guildId: string
): Promise<DiscordMember[]> {
	const all: DiscordMember[] = [];
	let after: string | undefined;

	try {
		for (;;) {
			const url = new URL(
				`https://discord.com/api/v10/guilds/${guildId}/members`
			);
			url.searchParams.set("limit", String(GUILD_MEMBERS_PAGE_LIMIT));
			if (after) {
				url.searchParams.set("after", after);
			}

			const response = await fetch(url.toString(), {
				headers: {
					Authorization: `Bot ${env.DISCORD_TOKEN}`,
				},
			});

			if (!response.ok) {
				const errorBody = await response
					.json()
					.catch(() => response.statusText);
				handleListMembersFailure(response, errorBody);
			}

			const page = (await response.json()) as DiscordMember[];
			if (page.length === 0) {
				break;
			}

			all.push(...page);

			if (page.length < GUILD_MEMBERS_PAGE_LIMIT) {
				break;
			}

			const last = page[page.length - 1];
			if (!last?.user?.id) {
				break;
			}
			after = last.user.id;
		}
	} catch (error) {
		if (error instanceof MessageResponseError) {
			throw error;
		}
		if (error instanceof Error) {
			throw new CodeBlockError(
				"Error fetching guild members:",
				error.stack || error.message
			);
		}

		throw error;
	}

	return all;
}
