import { verifyKey } from "discord-interactions";
import { Env } from "..";

export async function validateRequest(
	body: string,
	request: Request,
	env: Env
): Promise<boolean> {
	const signature = request.headers.get("x-signature-ed25519");
	const timestamp = request.headers.get("x-signature-timestamp");

	if (!signature || !timestamp) {
		throw new Error("Missing signature or timestamp headers");
	}

	// Verify the request signature
	const isValidRequest = await verifyKey(
		body,
		signature,
		timestamp,
		env.DISCORD_PUBLIC_KEY
	);

	if (!isValidRequest) {
		throw new Error("Invalid request signature");
	}

	return true;
}

export default validateRequest;
