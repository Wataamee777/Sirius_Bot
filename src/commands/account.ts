import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";
import { prisma } from "/src/database/db";

export const data = new SlashCommandBuilder()
	.setName("account")
	.setDescription("経済アカウントについての情報を表示します")
	.addSubcommand((sub) =>
		sub
			.setName("register")
			.setDescription("経済アカウントを登録します"),
	)
	.addSubcommand((sub) =>
		sub
			.setName("info")
			.setDescription("経済アカウントの詳細を表示します"),
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

		return;
	}

	if (subcommand === "info") {
		await interaction.deferRelpy();
		
		const account = await prisma.economyAccount.findUnique({
			where: {
				discordId: interaction.user.id,
			},
		});

		if (!account) {
			const notFoundEmbed = new EmbedBuilder()
				.setColor("Red")
				.setTitle("アカウント情報")
				.setDescription(
					"経済アカウントが登録されていません。\n`/account register` から登録してください。",
				);

			await interaction.editReply({
				embeds: [notFoundEmbed],
				ephemeral: true,
			});

			return;
		}

		const lastWorkAt = account.lastWorkAt
			? `<t:${Math.floor(account.lastWorkAt.getTime() / 1000)}:R>`
			: "まだ働いていません";

		const Descinfo = [
			`**名前**\n${account.name}`,
			`**所属**\n${account.affiliationName}`,
			`**コイン**\n${account.coins.toString()} コイン`,
			`**知力レベル**\nLv.${account.intelligenceLevel}`,
			`**満腹度**\n${account.satiation}/100`,
			`**幸福度**\n${account.happiness}/100`,
			`**状態**\n${account.status}`,
			`**最終労働**\n${lastWorkAt}`,
		].join("\n\n");

		const infoEmbed = new EmbedBuilder()
			.setColor("Green")
			.setTitle("アカウント情報")
			.setDescription(Descinfo)
			.setThumbnail(
				account.image ?? interaction.user.displayAvatarURL(),
			)
			.setFooter({
				text: `Discord ID: ${account.discordId}`,
			})
			.setTimestamp(account.updatedAt);

		await interaction.editReply({
			embeds: [infoEmbed],
		});

		return;
	}
}
