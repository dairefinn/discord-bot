import {
	InteractionResponseFlags,
	InteractionResponseType,
} from "discord-interactions";
import { DiscordInteractionResponse } from "../types/discord";

type InteractionData = NonNullable<DiscordInteractionResponse["data"]>;

/** Ephemeral channel message (visible only to the invoker). */
export function ephemeralReply(
	content: string,
	extras?: Pick<InteractionData, "allowed_mentions">
): DiscordInteractionResponse {
	return {
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content,
			flags: InteractionResponseFlags.EPHEMERAL,
			...(extras ?? {}),
		},
	};
}
