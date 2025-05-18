export class CodeBlockError extends Error {
	constructor(message: string, codeBlockContents: string) {
		const messageWithCodeBlock = `${message}\n\`\`\`${codeBlockContents}\n\`\`\``;
		super(messageWithCodeBlock);
		this.name = "CodeBlockError";
	}
}

export class MessageResponseError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "MessageResponseError";
	}
}
