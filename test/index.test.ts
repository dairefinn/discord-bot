import worker from "../src/index";

import {
	InteractionType,
	InteractionResponseType,
	InteractionResponseFlags,
} from "discord-interactions";
import { DiscordInteractionResponse } from "../src/types/discord";
import { ErrorResponse } from "../src/helpers/request-responses";

type ExecutionContext = {
	waitUntil: (promise: Promise<unknown>) => void;
	passThroughOnException: () => void;
};

describe("Discord Bot Worker", () => {
	const mockEnv = {
		DISCORD_TOKEN: "test-token",
		DISCORD_PUBLIC_KEY: "test-public-key",
		DISCORD_APPLICATION_ID: "test-app-id",
	};

	test("rejects non-POST requests", async () => {
		const result = await worker.fetch(
			new Request("http://falcon", { method: "PUT" }),
			mockEnv,
			{} as ExecutionContext
		);
		expect(result.status).toBe(405);
		const error: ErrorResponse = await result.json();
		expect(error.error).toBe("Method not allowed");
	});

	test("redirects GET requests to my website", async () => {
		const result = await worker.fetch(
			new Request("http://falcon", { method: "GET" }),
			mockEnv,
			{} as ExecutionContext
		);
		expect(result.status).toBe(302);
		expect(result.headers.get("Location")).toBe("https://www.dairefinn.com");
	});

	// test("rejects requests without signature headers", async () => {
	// 	jest.unmock("../src/helpers/request-validation");
	// 	const result = await worker.fetch(
	// 		new Request("http://falcon", {
	// 			method: "POST",
	// 			body: JSON.stringify({ type: InteractionType.PING }),
	// 		}),
	// 		mockEnv,
	// 		{} as ExecutionContext
	// 	);
	// 	expect(result.status).toBe(401);
	// 	const error: ErrorResponse = await result.json();
	// 	expect(error.error).toBe("Invalid request");
	// });

	// test("handles PING interaction", async () => {
	// 	const result = await worker.fetch(
	// 		new Request("http://falcon", {
	// 			method: "POST",
	// 			headers: {
	// 				"x-signature-ed25519": "test-signature",
	// 				"x-signature-timestamp": "test-timestamp",
	// 			},
	// 			body: JSON.stringify({ type: InteractionType.PING }),
	// 		}),
	// 		mockEnv,
	// 		{} as ExecutionContext
	// 	);
	// 	expect(result.status).toBe(200);
	// 	const response: ErrorResponse = await result.json();
	// 	expect(response).toEqual({ type: InteractionResponseType.PONG });
	// });

	// test("handles unknown command", async () => {
	// 	const result = await worker.fetch(
	// 		new Request("http://falcon", {
	// 			method: "POST",
	// 			headers: {
	// 				"x-signature-ed25519": "test-signature",
	// 				"x-signature-timestamp": "test-timestamp",
	// 			},
	// 			body: JSON.stringify({
	// 				type: InteractionType.APPLICATION_COMMAND,
	// 				data: {
	// 					name: "nonexistentcommand",
	// 				},
	// 			}),
	// 		}),
	// 		mockEnv,
	// 		{} as ExecutionContext
	// 	);

	// 	expect(result.status).toBe(200);

	// 	const response = (await result.json()) as DiscordInteractionResponse;

	// 	expect(response.type).toBe(
	// 		InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
	// 	);
	// 	expect(response.data).toBeDefined();
	// 	expect(response.data?.flags).toBe(InteractionResponseFlags.EPHEMERAL);
	// });
});
