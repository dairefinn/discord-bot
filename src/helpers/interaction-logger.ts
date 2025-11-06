import { DiscordInteraction } from "../types/discord";

export class InteractionLogger {
	private logs: Array<{ timestamp: string; message: string; data?: unknown }> =
		[];
	private type: "COMMAND" | "AUTOCOMPLETE";
	private interaction: DiscordInteraction;
	private startTime: number;

	constructor(
		interaction: DiscordInteraction,
		type: "COMMAND" | "AUTOCOMPLETE"
	) {
		this.interaction = interaction;
		this.type = type;
		this.startTime = Date.now();
	}

	log(message: string, data?: unknown) {
		this.logs.push({
			timestamp: new Date().toISOString(),
			message,
			data,
		});
	}

	finish(status: "success" | "error", error?: unknown) {
		const duration = Date.now() - this.startTime;
		const logOutput: Record<string, unknown> = {
			type: this.type,
			command: this.interaction.data?.name,
			user: {
				username:
					this.interaction.member?.user?.username ||
					this.interaction.user?.username ||
					"Unknown",
				id:
					this.interaction.member?.user?.id ||
					this.interaction.user?.id ||
					"Unknown",
			},
			options: this.interaction.data?.options || [],
			status,
			duration_ms: duration,
			logs: this.logs,
		};

		if (error) {
			logOutput.error =
				error instanceof Error
					? { message: error.message, stack: error.stack }
					: error;
		}

		console.log(JSON.stringify(logOutput));
	}
}
