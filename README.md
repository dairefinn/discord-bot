# Overview

This is a bot for the Discord app which I am creating because I am bored waiting for the game "The Lord of the Rings: Return to Moria" to install :)

I've recently started developing it again because I want to manage roles on my server. We have a role for every game we play and if we want to play it, we'll usually mention the role in the chat using @.

This bot allows me to create new roles for any games we are playing. For Example I could use `/registergame Arc raiders` to create the "Arc raiders players" role. Anyone interested in playing can use the `/addgame` command to add themselves to the new role and when someone types `@Arc Raiders Players` in a channel they will be notified. When a person decides they no longer want to play a game they can use `/removegame` to remove themselves from the role. If nobody is playing a game anymore and I don't see us playing again in the future I can use `/unregistergame <GAME_NAME>` to delete the role.

`/addgame`, `/removegame` and `/unregistergame` all have autocomplete suggestions which query the existing roles and suggest them to the user. The bot knows which roles to suggest because all the game roles end with " players" - this is just a convention I've chosen to make it easier to identify the game roles without having to use any sort of database.

# Features

## Game role management

I'm using this bot to manage roles on my server. Admins can register and unregister games that players are playing in their server. Players than then opt in to roles related to these games. This allows players to mention the role in the chat to try and get others to play with them.

**Commands:**

- `/addgame <GAME_NAME>` - Adds you to the role of the provided game if it exists.
- `/removegame <GAME_NAME>` - Removes you from the role of the provided game if it exists.
- `/registergame <GAME_NAME>` - Registers a game with the bot. This will create a new role with the name of the game.
- `/unregistergame <GAME_NAME>` - Unregisters a game with the bot. This will delete the role with the name of the game.

## Other commands

- `/echo` - A simple echo command to check if the bot is online. Responds with the same message that was sent to the bot.

# Environment variables

- DISCORD_TOKEN - The token used to authenticate with the Discord API
- DISCORD_CLIENT_ID - The client ID used to identify the user authenticating with the Discord API
