import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";
import { ERROR_ICON_URL, SUCCESS_ICON_URL } from "@/utils/embedIcons";

const command = {
	data: new SlashCommandBuilder()
		.setName("ggrks")
		.setDescription("Google検索URLを作成します")
		.addStringOption((option) =>
			option.setName("query").setDescription("検索語句").setRequired(true),
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const sendReply = async (embed: EmbedBuilder) => {
			const replyPayload = { embeds: [embed] };
			const editPayload = { embeds: [embed] };
			const followUpPayload = {
				embeds: [embed],
			};

			const tryEdit = async () => {
				try {
					return await interaction.editReply(editPayload);
				} catch (error) {
					if (
						error instanceof Error &&
						error.name === "InteractionNotReplied"
					) {
						return null;
					}
					throw error;
				}
			};

			const tryReply = async () => {
				try {
					return await interaction.reply(replyPayload);
				} catch (error) {
					if ((error as { code?: number }).code === 40060) {
						return null;
					}
					throw error;
				}
			};

			const tryFollowUp = async () => {
				try {
					return await interaction.followUp(followUpPayload);
				} catch {
					return null;
				}
			};

			if (interaction.deferred || interaction.replied) {
				const edited = await tryEdit();
				if (edited) {
					return edited;
				}
				const replied = await tryReply();
				if (replied) {
					return replied;
				}
				await tryFollowUp();
				return;
			}

			const replied = await tryReply();
			if (replied) {
				return replied;
			}

			const edited = await tryEdit();
			if (edited) {
				return edited;
			}

			await tryFollowUp();
		};

		const replyError = async (content: string) => {
			const embed = new EmbedBuilder()
				.setAuthor({
					name: "エラー",
					iconURL: ERROR_ICON_URL,
				})
				.setDescription(content)
				.setColor(0xed4245)
				.setTimestamp(new Date());
			await sendReply(embed);
		};

		if (!interaction.deferred && !interaction.replied) {
			try {
				await interaction.deferReply();
			} catch {
				// If defer fails, continue and attempt a normal reply in sendReply.
			}
		}

		const query = interaction.options.getString("query", true).trim();

		if (!query) {
			await replyError("❌ 検索語句を入力してください。");
			return;
		}

		const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
		const embed = new EmbedBuilder()
			.setAuthor({
				name: "ggrks",
				iconURL: SUCCESS_ICON_URL,
			})
			.setColor(0x4285f4)
			.setDescription(`[Googleで検索する](${searchUrl})`)
			.addFields({ name: "検索語句", value: query })
			.setTimestamp(new Date());

		await sendReply(embed);
	},
};

export default command;
