import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";

// 変数名を command から data に変更し、直接エクスポート
export const data = new SlashCommandBuilder()
	.setName("account")
	.setDescription("経済アカウントについての情報を表示します")
	.addSubcommand((sub) =>
		sub.setName("register").setDescription("経済アカウントを登録します"),
	);

export async function execute(interaction: ChatInputCommandInteraction) {
	const subcommand = interaction.options.getSubcommand();

	if (subcommand === "register") {
		const successEmbed = new EmbedBuilder()
			.setColor("Blue")
			.setTitle("アカウント登録")
			.setDescription(
				"経済アカウントを登録するには以下のボタンをクリックしてください。",
			);

		// ※先ほど分けた新しい登録ページのURL（/dashboard/register など）に変更するのをお忘れなく！
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setLabel("アカウント登録ページへ")
				.setStyle(ButtonStyle.Link)
				.setURL("https://siriusbot.f5.si/login"),
		);

		await interaction.reply({
			embeds: [successEmbed],
			components: [row],
		});
	}
}
