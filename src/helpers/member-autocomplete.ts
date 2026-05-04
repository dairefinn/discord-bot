import { DiscordMember } from "../types/discord";
import { AutocompleteChoice } from "./autocomplete";
import { memberDisplayName } from "./member-mention-list";

function memberMatchesQuery(member: DiscordMember, q: string): boolean {
	const id = member.user.id.toLowerCase();
	const username = (member.user.username || "").toLowerCase();
	const display = memberDisplayName(member).toLowerCase();
	return id.includes(q) || username.includes(q) || display.includes(q);
}

/**
 * Autocomplete choices for guild members, optional filter to exclude a role
 * (e.g. members who already have the game role).
 */
export function buildMemberAutocompleteChoices(
	focusedValue: string,
	members: DiscordMember[],
	excludeRoleId?: string
): AutocompleteChoice[] {
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
