/**
 * This file provides type-safe access to environment variables.
 * The actual values are provided by Cloudflare Workers through the env parameter.
 */

export interface Env {
  DISCORD_TOKEN: string;
  DISCORD_PUBLIC_KEY: string;
  DISCORD_APPLICATION_ID: string;
}

// This is just a type reference - the actual values come from the env parameter
export const config = {
  DISCORD_TOKEN: '',
  DISCORD_PUBLIC_KEY: '',
  DISCORD_APPLICATION_ID: '',
} as const;
