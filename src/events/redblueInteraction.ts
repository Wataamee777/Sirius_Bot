import {
	type ButtonInteraction,
	Events,
	type Interaction,
	MessageFlags,
	type ModalSubmitInteraction,
} from "discord.js";
import { handleRedBlueButtonInteraction } from "@/commands/redblue";

export default {
	name: Events.InteractionCreate,
	async execute(interaction: Interaction) {
		if (interaction.isButton()) {
			await handleRedBlueButtonInteraction(interaction as ButtonInteraction);
		}
	},
};
