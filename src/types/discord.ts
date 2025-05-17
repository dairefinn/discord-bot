export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string;
}

export interface DiscordMember {
  user: DiscordUser;
  roles: string[];
  voice?: {
    channel_id: string;
  };
}

export interface DiscordRole {
  id: string;
  name: string;
  permissions: string;
  color: number;
  hoist: boolean;
  position: number;
  mentionable: boolean;
}

export interface DiscordInteraction {
  id: string;
  application_id: string;
  type: number;
  data?: {
    id: string;
    name: string;
    type: number;
    options?: Array<{
      name: string;
      type: number;
      value?: string | number | boolean;
      focused?: boolean;
    }>;
  };
  guild_id: string;
  channel_id: string;
  member: DiscordMember;
  token: string;
  version: number;
}

export interface DiscordInteractionResponse {
  type: number;
  data?: {
    content?: string;
    flags?: number;
    choices?: Array<{
      name: string;
      value: string;
    }>;
  };
}

export const FlagEphemeral = 64;
