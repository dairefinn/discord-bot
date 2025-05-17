/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npx wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npx wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { InteractionResponseType, InteractionType, verifyKey } from 'discord-interactions';
import { commands, Command } from './commands';
import { DiscordInteraction, FlagEphemeral } from './types/discord';

// These initial Types are based on bindings that don't exist in the project yet,
// you can follow the links to learn how to implement them.

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket
	DISCORD_TOKEN: string;
	DISCORD_PUBLIC_KEY: string;
	DISCORD_APPLICATION_ID: string;
}

const worker = {
	async fetch(
		request: Request,
		env: Env,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_ctx: ExecutionContext
	): Promise<Response> {
		if (request.method === 'POST') {
			// Verify the request is coming from Discord
			const signature = request.headers.get('x-signature-ed25519');
			const timestamp = request.headers.get('x-signature-timestamp');
			const body = await request.text();

			if (!signature || !timestamp) {
				return new Response('Missing signature headers', { status: 401 });
			}

			const isValidRequest = verifyKey(
				body,
				signature,
				timestamp,
				env.DISCORD_PUBLIC_KEY
			);

			if (!isValidRequest) {
				return new Response('Invalid request signature', { status: 401 });
			}

			const interaction = JSON.parse(body) as DiscordInteraction;

			// Handle PING
			if (interaction.type === InteractionType.PING) {
				return new Response(
					JSON.stringify({ type: InteractionResponseType.PONG }),
					{
						headers: { 'Content-Type': 'application/json' },
					}
				);
			}

			// Handle slash commands
			if (interaction.type === InteractionType.APPLICATION_COMMAND) {
				try {
					if (!interaction.data) {
						throw new Error('Missing command data');
					}
					const command = commands[interaction.data.name as keyof typeof commands] as Command;
					if (command) {
						const response = await command.execute(interaction);
						return new Response(JSON.stringify(response), {
							headers: { 'Content-Type': 'application/json' },
						});
					}
				} catch (error: unknown) {
					console.error('Error handling command:', error);
					const errorMessage = error instanceof Error ? error.message : 'An error occurred.';
					return new Response(
						JSON.stringify({
							type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
							data: {
								content: errorMessage,
								flags: FlagEphemeral,
							},
						}),
						{
							headers: { 'Content-Type': 'application/json' },
						}
					);
				}
			}

			// Handle autocomplete
			if (interaction.type === InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE) {
				if (!interaction.data) {
					return new Response('Missing command data', { status: 400 });
				}
				const command = commands[interaction.data.name as keyof typeof commands] as Command;
				if (command?.autocomplete) {
					const response = await command.autocomplete(interaction);
					return new Response(JSON.stringify(response), {
						headers: { 'Content-Type': 'application/json' },
					});
				}
			}
		}

		return new Response('Method not allowed', { status: 405 });
	},
};

export default worker;
