# Overview

This is a bot for the Discord app which I am creating because I am bored waiting for the game "The Lord of the Rings: Return to Moria" to install :)

I've recently started developing it again because I want to manage roles on my server. We have a role for every game we play and if we want to play it, we'll usually @ the role in the chat. I want this bot to allow people to register their own games so I don't have to do it manually. I also want people to be able to join and leave these roles automatically so that I also don't have to do it manually.

# Dependencies

- discord.js - The core Discord library
- dotenv - Allows a .env file to be used to store environment variables

# Dev dependenices

- tsup - Used to bundle TypeScript
- tsx - Used to execute the bundled TypeScript files
- typescript - The language this project uses

# Environment variables

- DISCORD_TOKEN - The token used to authenticate with the Discord API
- DISCORD_CLIENT_ID - The client ID used to identify the user authenticating with the Discord API
