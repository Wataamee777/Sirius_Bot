import { prisma } from "@sirius/database";
import { DiscordAPIError, Events, type Message } from "discord.js";

const notifyGuildOwner = async (message: Message, content: string) => {
	const guild = message.guild;
	const owner = await guild?.fetchOwner().catch(() => null);

	await owner?.send(content).catch(() => {});
};

const removeAutoReaction = async (
	serverId: string,
	failedReaction: unknown,
): Promise<unknown[]> => {
	// Fetch the latest state from the database to handle concurrent updates
	const currentSettings = await prisma.serverSetting.findUnique({
		where: { serverId },
	});

	if (!currentSettings?.autoReactions) {
		return [];
	}

	const currentReactions = JSON.parse(currentSettings.autoReactions);
	if (!Array.isArray(currentReactions)) {
		return [];
	}

	const filtered = currentReactions.filter(
		(reaction) => reaction !== failedReaction,
	);

	await prisma.serverSetting.update({
		where: { serverId },
		data: {
			autoReactions: filtered.length > 0 ? JSON.stringify(filtered) : null,
		},
	});

	return filtered;
};

export default {
	name: Events.MessageCreate,
	async execute(message: Message) {
		// Bot自身のメッセージは無視
		if (message.author.bot || !message.guildId) return;

		try {
			// ギルド設定を取得
			const settings = await prisma.serverSetting.findUnique({
				where: { serverId: message.guildId },
			});

			if (!settings?.autoReactions) return;

			// Auto Reactions設定をパース
			let autoReactions = JSON.parse(settings.autoReactions);
			if (!Array.isArray(autoReactions) || autoReactions.length === 0) return;

			// 対象チャンネルのリアクションを処理
			for (const reaction of autoReactions) {
				// チャンネルチェック
				if (
					reaction.channelId !== "all" &&
					reaction.channelId !== message.channelId
				) {
					continue;
				}

				// 絵文字が設定されているかチェック
				if (!reaction.emoji) continue;

				try {
					// 絵文字を追加
					await message.react(reaction.emoji);
				} catch (error) {
					if (error instanceof DiscordAPIError && error.code === 50013) {
						autoReactions = await removeAutoReaction(message.guildId, reaction);
						await notifyGuildOwner(
							message,
							`Sirius の自動リアクションで絵文字「${reaction.emoji}」を付けようとしましたが、権限がありませんでした。コンソールエラーの再発を防ぐため、この自動リアクション設定を DB から削除しました。Bot に「リアクションを追加」と「メッセージ履歴を読む」権限があることを確認してから、必要に応じて管理画面で設定し直してください。`,
						);
						continue;
					}

					console.error(
						`Failed to add reaction ${reaction.emoji} to message ${message.id}:`,
						error,
					);
				}
			}
		} catch (error) {
			console.error("Auto Reaction error:", error);
		}
	},
};
