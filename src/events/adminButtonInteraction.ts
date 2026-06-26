import {
	type ButtonInteraction,
	Events,
	type Interaction,
} from "discord.js";
import { handleAdminDbButtonInteraction } from "@/commands/admin";

export default {
	name: Events.InteractionCreate,
	async execute(interaction: Interaction) {
		if (!interaction.isButton()) return;
		if (!interaction.customId.startsWith("admin-db-")) return;

		try {
			await handleAdminDbButtonInteraction(interaction as ButtonInteraction);
		} catch (error) {
			console.error("admin db button handler error:", error);
		}
	},
};
