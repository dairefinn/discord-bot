# Overview

This is a bot for the Discord app which I am creating because I am bored waiting for the game "The Lord of the Rings: Return to Moria" to install :)

I've recently started developing it again because I want to manage roles on my server. We have a role for every game we play and if we want to play it, we'll usually @ the role in the chat. I want this bot to allow people to register their own games so I don't have to do it manually. I also want people to be able to join and leave these roles automatically so that I also don't have to do it manually.

# Features

## Game role management

I'm using this bot to manage roles on my server. Admins can register and unregister games that players are playing in their server. Players than then opt in to roles related to these games. This allows players to mention the role in the chat to try and get others to play with them.

**Commands:**

- `/addgame <GAME_NAME>` - Adds you to the role of the provided game if it exists.
- `/removegame <GAME_NAME>` - Removes you from the role of the provided game if it exists.
- `/registergame <GAME_NAME>` - Registers a game with the bot. This will create a new role with the name of the game.
- `/unregistergame <GAME_NAME>` - Unregisters a game with the bot. This will delete the role with the name of the game.

## Other commands

- `/ping` - A simple ping command to check if the bot is online. Responds with "Pong!" if the bot is online.
- `/echo` - A simple echo command to check if the bot is online. Responds with the same message that was sent to the bot.
- `/gnomed` - Joins the voice channel of the user who sent the command, plays a gnome ooh sound effect and then leaves the voice channel.

# Getting started

## Setup

1. Clone the repository
2. Run `npm install`/`yarn install` to install the dependencies
3. Create a copy of the `.env.example` file and rename it to `.env`
4. Create a Discord application at https://discord.com/developers/
5. Fill in the `.env` file with the required information

## Running

**Production:**
Run `npm run build`/`yarn build` to build the project. Run `npm start`/`yarn start` afterwards to start the bot

**Development:**
Run `npm run dev`/`yarn dev` to start the bot in development mode. This will watch for changes in the code and automatically restart the bot when changes are made.

# Environment variables

- DISCORD_TOKEN - The token used to authenticate with the Discord API
- DISCORD_CLIENT_ID - The client ID used to identify the user authenticating with the Discord API
