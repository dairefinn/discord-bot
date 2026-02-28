import { CodeBlockError } from "../types/errors";

export async function assertResponseOk(
	response: Response,
	action: string
): Promise<void> {
	if (!response.ok) {
		const errorData = await response.json().catch(() => response.statusText);
		throw new CodeBlockError(
			`Failed to ${action}:`,
			JSON.stringify(errorData)
		);
	}
}
