import dotenv from "dotenv";

/**
 * This file will load the environment variables from the .env file.
 * It will then store them in a config object for easy access.
 */

dotenv.config();

const { DISCORD_TOKEN, DISCORD_CLIENT_ID } = process.env;

// Throw error if missing environment variables
if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  throw new Error("Missing environment variables");
}

// Store environment variables in config object to make them more easily accessible
export const config = {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
};
