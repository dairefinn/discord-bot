import { InteractionResponseType } from 'discord-interactions';
import { DiscordInteraction, DiscordInteractionResponse, FlagEphemeral } from '../types/discord';

import * as addgame from "./game-roles/addgame";
import * as removegame from "./game-roles/removegame";
import * as registergame from "./game-roles/registergame";
import * as unregistergame from "./game-roles/unregistergame";
import * as listgames from "./game-roles/listgames";

export interface Command {
  data: {
    name: string;
    description: string;
    type: number;
    options?: Array<{
      name: string;
      description: string;
      type: number;
      required?: boolean;
      autocomplete?: boolean;
    }>;
  };
  execute: (interaction: DiscordInteraction) => Promise<DiscordInteractionResponse>;
  autocomplete?: (interaction: DiscordInteraction) => Promise<DiscordInteractionResponse>;
}

/**
 * This file registers all commands.
 * When a new command is created, it should be added here in order to be usable.
 */
export const commands: { [key: string]: Command } = {
  addgame,
  removegame,
  registergame,
  unregistergame,
  listgames,
  echo: {
    data: {
      name: "echo",
      description: "Replies with the content of the message",
      type: 1,
      options: [
        {
          name: "message",
          description: "The message to echo",
          type: 3, // STRING
          required: true
        }
      ]
    },
    execute: async (interaction: DiscordInteraction): Promise<DiscordInteractionResponse> => {
      const message = interaction.data?.options?.find(opt => opt.name === "message")?.value;
      
      if (!message || typeof message !== 'string') {
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Please provide a message to echo.",
            flags: FlagEphemeral
          }
        };
      }

      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: message,
          flags: FlagEphemeral
        }
      };
    }
  }
};
