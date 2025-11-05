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

export interface DiscordInteractionOption {
	name: string;
	type: number;
	value?: string | number | boolean;
	focused?: boolean;
	options?: DiscordInteractionOption[];
}

export interface DiscordInteraction {
	id: string;
	application_id: string;
	type: number;
	data?: {
		id: string;
		name: string;
		type: number;
		options?: DiscordInteractionOption[];
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

export interface DiscordGuild {
	id: string;
	name: string;
	owner_id: string;
}

export interface DiscordCommandOption {
	name: string;
	description: string;
	type: number;
	required?: boolean;
	choices?: Array<{
		name: string;
		value: string | number;
	}>;
	autocomplete?: boolean;
	options?: DiscordCommandOption[];
}

export interface DiscordCommandData {
	id?: string;
	type?: number;
	// application_id?: string;
	// guild_id?: string;
	name: string;
	// name_localizations?:
	description: string;
	// description_localizations?:
	options?: DiscordCommandOption[];
	default_member_permissions?: string;
	// dm_permission?: boolean;
	// default_permission?: boolean;
	// nsfw?: boolean;
	// integration_types?:
	// contexts?:
	// version: string;
	// handler?:
}

export enum DiscordCommandType {
	CHAT_INPUT = 1,
	USER = 2,
	MESSAGE = 3,
	PRIMARY_ENTRY_POINT = 4,
}

export enum DiscordCommandOptionType {
	SUB_COMMAND = 1,
	SUB_COMMAND_GROUP = 2,
	STRING = 3,
	INTEGER = 4,
	BOOLEAN = 5,
	USER = 6,
	CHANNEL = 7,
	ROLE = 8,
	MENTIONABLE = 9,
	NUMBER = 10,
	ATTACHMENT = 11,
}
