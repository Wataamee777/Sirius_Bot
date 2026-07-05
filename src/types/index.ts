import type { Client } from "discord.js";

export interface ExtendedClient extends Client {
	commands?: Map<string, unknown>;
	cooldowns?: Map<string, number>;
}
