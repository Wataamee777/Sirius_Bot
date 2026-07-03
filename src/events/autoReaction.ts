import { EmbedBuilder, Events, type Message } from "discord.js";
import { prisma } from "@/database/db";
import type { ExtendedClient } from "../types";

export default {
	name: Events.MessageCreate,
	async execute(message: Message, client: ExtendedClient) {
		// Bot自身のメッセージは無視
		if (message.author.bot) return;

		try {
			// ギルド設定を取得
			const settings = await prisma.serverSetting.findUnique({
				where: { serverId: message.guildId || "" },
			});

			if (!settings || !settings.autoReactions) return;

			// Auto Reactions設定をパース
			const autoReactions = JSON.parse(settings.autoReactions);
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
