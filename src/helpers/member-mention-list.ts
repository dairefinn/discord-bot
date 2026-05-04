import { DiscordMember } from "../types/discord";
import { DISCORD_MESSAGE_CONTENT_MAX } from "../constants/discord-api";

export function memberDisplayName(member: DiscordMember): string {
	const name =
		(member.nick && member.nick.trim()) || member.user.username || "";
	return name || member.user.id;
}

export function memberMention(member: DiscordMember): string {
	return `<@${member.user.id}>`;
}

/** Markdown list line (same style as `listgames` bullets). */
export function memberListLine(member: DiscordMember): string {
	return `- ${memberMention(member)}`;
}

/**
 * Discord message body: title, bullet lines of user mentions, optional truncation.
 * Pair with `allowed_mentions` on the interaction response so mentions render.
 */
export function buildBulletMentionListContent(
	titleLabel: string,
	members: DiscordMember[]
): {
	content: string;
	allowed_mentions: { users: string[] };
} {
	const sorted = [...members].sort((a, b) =>
		memberDisplayName(a)
			.toLowerCase()
			.localeCompare(memberDisplayName(b).toLowerCase())
	);

	const header = `**${titleLabel}** — ${sorted.length} player(s)\n\n`;
	const suffixFor = (n: number) =>
		`\n\n_…and ${n} more not shown (message length limit)._`;

	const bodyFull = sorted.map((m) => memberListLine(m)).join("\n");
	const full = header + bodyFull;
	if (full.length <= DISCORD_MESSAGE_CONTENT_MAX) {
		return {
			content: full,
			allowed_mentions: { users: sorted.map((m) => m.user.id) },
		};
	}

	const included: DiscordMember[] = [];
	for (const m of sorted) {
		const wouldInclude = [...included, m];
		const omitted = sorted.length - wouldInclude.length;
		const candidate =
			header +
			wouldInclude.map((mem) => memberListLine(mem)).join("\n") +
			(omitted > 0 ? suffixFor(omitted) : "");
		if (candidate.length <= DISCORD_MESSAGE_CONTENT_MAX) {
			included.push(m);
		} else {
			break;
		}
	}

	const omitted = sorted.length - included.length;
	const content =
		header +
		included.map((m) => memberListLine(m)).join("\n") +
		(omitted > 0 ? suffixFor(omitted) : "");
	return {
		content,
		allowed_mentions: { users: included.map((m) => m.user.id) },
	};
}
