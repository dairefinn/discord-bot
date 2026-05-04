import { InteractionResponseType } from "discord-interactions";
import { DISCORD_AUTOCOMPLETE_MAX_CHOICES } from "../constants/discord-api";
import { DiscordInteractionResponse } from "../types/discord";

export type AutocompleteChoice = { name: string; value: string };

function capAutocompleteChoices<T extends AutocompleteChoice>(choices: T[]): T[] {
	return choices.slice(0, DISCORD_AUTOCOMPLETE_MAX_CHOICES);
}

/**
 * Ensures autocomplete results respect Discord's choice limit. Call from the
 * global autocomplete handler so individual commands do not need to cap.
 */
export function capAutocompleteInteractionResponse(
	response: DiscordInteractionResponse
): DiscordInteractionResponse {
	if (response.type !== InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT) {
		return response;
	}
	const choices = response.data?.choices;
	if (!choices?.length) {
		return response;
	}
	return {
		...response,
		data: {
			...response.data,
			choices: capAutocompleteChoices(choices),
		},
	};
}