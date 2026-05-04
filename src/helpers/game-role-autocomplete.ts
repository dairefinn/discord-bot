import { DiscordRole } from "../api/roles";
import { AutocompleteChoice } from "./autocomplete";
import { formatGameName } from "./game-roles";

/**
 * Autocomplete choices for game roles named `"{Game} players"`, with
 * list-style filtering and sorting (matches `listgame` / `registerplayer`).
 */
export function buildGameRoleAutocompleteChoices(
	focusedQuery: string,
	roles: DiscordRole[]
): AutocompleteChoice[] {
	let roleOptions = roles.filter((role) =>
		role.name.toLowerCase().endsWith(" players")
	);

	if (focusedQuery && typeof focusedQuery === "string") {
		const q = focusedQuery.toLowerCase();
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

/**
 * Autocomplete for game roles: substring match on the full Discord role name,
 * sorted by display name. Optional `predicate` narrows the set (e.g. only
 * roles the member has or has not). Used by `addgame`, `removegame`, and
 * `unregistergame`.
 */
export function buildSimpleGameRoleAutocompleteChoices(
	focusedQuery: string,
	roles: DiscordRole[],
	predicate?: (role: DiscordRole) => boolean
): AutocompleteChoice[] {
	let roleOptions = roles.filter((role) =>
		role.name.toLowerCase().endsWith(" players")
	);
	if (predicate) {
		roleOptions = roleOptions.filter(predicate);
	}
	if (focusedQuery?.trim()) {
		const q = focusedQuery.toLowerCase();
		roleOptions = roleOptions.filter((role) =>
			role.name.toLowerCase().includes(q)
		);
	}
	roleOptions.sort((a, b) =>
		formatGameName(a)
			.toLowerCase()
			.localeCompare(formatGameName(b).toLowerCase())
	);
	return roleOptions.map((r) => {
		const short = formatGameName(r);
		return { name: short, value: short };
	});
}
