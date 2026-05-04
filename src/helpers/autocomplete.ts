import { InteractionResponseType } from "discord-interactions";
import { DISCORD_AUTOCOMPLETE_MAX_CHOICES } from "../constants/discord-api";
import { DiscordInteraction, DiscordInteractionResponse } from "../types/discord";

/**
 * Focused option name and string value for autocomplete interactions.
 */
export function getAutocompleteFocus(interaction: DiscordInteraction): {
	optionName: string | undefined;
	value: string;
} {
	const focusedOption = interaction.data?.options?.find((opt) => opt.focused);
	const value =
		(typeof focusedOption?.value === "string" ? focusedOption.value : "") || "";
	return { optionName: focusedOption?.name, value };
}

export type AutocompleteChoice = { name: string; value: string };

export function autocompleteResult(
	choices: AutocompleteChoice[]
): DiscordInteractionResponse {
	return {
		type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
		data: { choices },
	};
}

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