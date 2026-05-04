import { DiscordCommandData } from "../types/discord";

/** Renders a slash command as Discord shows it, or `/${name}` / `""` if unknown. */
export function slashCommandMention(cmd: DiscordCommandData | undefined): string {
	if (cmd?.id && cmd.name) {
		return `</${cmd.name}:${cmd.id}>`;
	}
	return cmd?.name ? `/${cmd.name}` : "";
}
