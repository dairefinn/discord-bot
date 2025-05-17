import worker from "../src/index";
import { InteractionType, InteractionResponseType } from 'discord-interactions';

// Mock ExecutionContext type since it's not available in tests
type ExecutionContext = {
	waitUntil: (promise: Promise<unknown>) => void;
	passThroughOnException: () => void;
};

describe('Discord Bot Worker', () => {
	const mockEnv = {
		DISCORD_TOKEN: 'test-token',
		DISCORD_PUBLIC_KEY: 'test-public-key',
		DISCORD_APPLICATION_ID: 'test-app-id'
	};

	test('rejects non-POST requests', async () => {
		const result = await worker.fetch(
			new Request('http://falcon', { method: 'GET' }),
			mockEnv,
			{} as ExecutionContext
		);
		expect(result.status).toBe(405);
		expect(await result.text()).toBe('Method not allowed');
	});

	test('rejects requests without signature headers', async () => {
		const result = await worker.fetch(
			new Request('http://falcon', { 
				method: 'POST',
				body: JSON.stringify({ type: InteractionType.PING })
			}),
			mockEnv,
			{} as ExecutionContext
		);
		expect(result.status).toBe(401);
		expect(await result.text()).toBe('Missing signature headers');
	});

	test('handles PING interaction', async () => {
		const result = await worker.fetch(
			new Request('http://falcon', { 
				method: 'POST',
				headers: {
					'x-signature-ed25519': 'test-signature',
					'x-signature-timestamp': 'test-timestamp'
				},
				body: JSON.stringify({ type: InteractionType.PING })
			}),
			mockEnv,
			{} as ExecutionContext
		);
		expect(result.status).toBe(200);
		const response = await result.json();
		expect(response).toEqual({ type: InteractionResponseType.PONG });
	});

	test('handles unknown command', async () => {
		const result = await worker.fetch(
			new Request('http://falcon', { 
				method: 'POST',
				headers: {
					'x-signature-ed25519': 'test-signature',
					'x-signature-timestamp': 'test-timestamp'
				},
				body: JSON.stringify({
					type: InteractionType.APPLICATION_COMMAND,
					data: {
						name: 'nonexistentcommand'
					}
				})
			}),
			mockEnv,
			{} as ExecutionContext
		);
		expect(result.status).toBe(200);
		const response = await result.json();
		expect(response.type).toBe(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE);
		expect(response.data.flags).toBe(64); // Ephemeral flag
	});
});
