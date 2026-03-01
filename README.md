# Overview

This is a bot for the Discord app which I am creating because I am bored waiting for the game "The Lord of the Rings: Return to Moria" to install :)

I've recently started developing it again because I want to manage roles on my server. We have a role for every game we play and if we want to play it, we'll usually mention the role in the chat using @.

This bot allows me to create new roles for any games we are playing. For Example I could use `/registergame Arc raiders` to create the "Arc raiders players" role. Anyone interested in playing can use the `/addgame` command to add themselves to the new role and when someone types `@Arc Raiders Players` in a channel they will be notified. When a person decides they no longer want to play a game they can use `/removegame` to remove themselves from the role. If nobody is playing a game anymore and I don't see us playing again in the future I can use `/unregistergame` to delete the role.

`/addgame`, `/removegame` and `/unregistergame` all have autocomplete suggestions which query the existing roles and suggest them to the user. The bot knows which roles to suggest because all the game roles end with " players" - this is just a convention I've chosen to make it easier to identify the game roles without having to use any sort of database.

# Features

## Game role management

I'm using this bot to manage roles on my server. Admins can register and unregister games that players are playing in their server. Players can then opt in to roles related to these games. This allows players to mention the role in the chat to try and get others to play with them.

**Commands:**

- `/addgame <GAME_NAME>` - Adds you to the role of the provided game if it exists.
- `/removegame <GAME_NAME>` - Removes you from the role of the provided game if it exists.
- `/listgames` - Lists all registered games, split into games you've joined and games available to join.
- `/registergame <GAME_NAME>` - *(Admin)* Registers a game with the bot. This will create a new role with the name of the game.
- `/unregistergame <GAME_NAME>` - *(Admin)* Unregisters a game with the bot. This will delete the role with the name of the game.

## Event announcements

Admins can broadcast Discord events to the server with an `@everyone` mention so nobody misses out. The bot validates and reconstructs the event URL to prevent abuse of the `@everyone` ping.

**Commands:**

- `/event init <EVENT_URL>` - *(Admin)* Posts an `@everyone` announcement linking to the provided Discord event.

## Utility & admin

A handful of commands for bot administration and diagnostics. `/synccommands` pushes the latest command definitions to a server, while `/ping` and `/echo` are quick health-checks.

- `/synccommands` - *(Admin)* Bulk-overwrites all bot commands on the current server.
- `/ping` - *(Admin)* Replies with "Pong!".
- `/echo <MESSAGE>` - *(Admin)* Echoes the provided message back.

# Environment variables

- DISCORD_TOKEN - The token used to authenticate with the Discord API
- DISCORD_CLIENT_ID - The client ID used to identify the user authenticating with the Discord API
