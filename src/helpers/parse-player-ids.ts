/** Discord user snowflakes are numeric strings, typically 17–19 digits. */
const SNOWFLAKE_TOKEN = /^\d{17,20}$/;
const MENTION_RE = /<@!?(\d{17,20})>/g;

/**
 * Extracts user IDs from a slash-option string: role mentions, user mentions,
 * and bare snowflake tokens (whitespace/comma separated). Order is preserved;
 * duplicates are removed.
 */
export function parsePlayerIds(input: string): string[] {
	const seen = new Set<string>();
	const out: string[] = [];

	const add = (id: string): void => {
		if (!seen.has(id)) {
			seen.add(id);
			out.push(id);
		}
	};

	const trimmed = input.trim();
	if (!trimmed) {
		return out;
	}

	let m: RegExpExecArray | null;
	const mentionRe = new RegExp(MENTION_RE.source, "g");
	while ((m = mentionRe.exec(trimmed)) !== null) {
		add(m[1]);
	}

	const withoutMentions = trimmed.replace(/<@!?\d+>/g, " ");
	const tokens = withoutMentions.split(/[\s,]+/).filter(Boolean);
	for (const t of tokens) {
		if (SNOWFLAKE_TOKEN.test(t)) {
			add(t);
		}
	}

	return out;
}
