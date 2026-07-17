import type { Client } from "discord.js";
import { Events } from "discord.js";
import { prisma } from "@/database/prisma";
import { updateGlobalPresence } from "@/utils/presence";
import { sendBotOnlineStatus } from "@/utils/statusWebhook";

const REMINDER_CHECK_INTERVAL = 10_000;

const event = {
	name: Events.ClientReady,
	once: true,

	async execute(client: Client) {
		const shardId = client.shard?.ids?.[0] ?? 0;

		console.log(
			`✅ ${client.user?.tag} にログインしました！ (Shard ${shardId})`,
		);

		// ======================
		// 全シャード起動待ち
		// ======================
		const waitForShardsReady = async (): Promise<void> => {
			if (!client.shard) return;

			let ready = false;

			while (!ready) {
				try {
					const statuses = await client.shard.broadcastEval(
						(c) => c.ws.status,
					);

					// 0 = READY
					ready = statuses.every((s) => s === 0);
				} catch {
					ready = false;
				}

				if (!ready) {
					await new Promise((r) => setTimeout(r, 2000));
				}
			}
		};

		await waitForShardsReady();
		console.log("✅ 全シャード起動完了");

		// ======================
		// リマインダー処理
		// Shard 0 のみ
		// ======================
		if (shardId === 0) {
			const processReminders = async () => {
				try {
					const reminders = await prisma.reminder.findMany({
						where: {
							remindAt: {
								lte: new Date(),
							},
						},
						take: 100,
					});

					for (const reminder of reminders) {
						try {
							// サーバー設定から通知ロールを取得
							const setting =
								await prisma.serverSetting.findUnique({
									where: {
										serverId: reminder.serverId,
									},
									select: {
										reminderRoleId: true,
									},
								});

							const content = setting?.reminderRoleId
								? `<@&${setting.reminderRoleId}> ${reminder.content}`
								: reminder.content;

							const results =
								await client.shard?.broadcastEval(
									async (c, context) => {
										const channel =
											c.channels.cache.get(
												context.channelId,
											);

										if (
											!channel?.isTextBased() ||
											!channel.isSendable()
										) {
											return false;
										}

										await channel.send({
											content: context.content,
											allowedMentions: {
												roles: context.roleId
													? [context.roleId]
													: [],
											},
										});

										return true;
									},
									{
										context: {
											channelId: reminder.channelId,
											content,
											roleId: setting?.reminderRoleId,
										},
										shard: "all",
									},
								);

							const sent = results?.some(Boolean) ?? false;

							// 送信成功したらリマインダーを削除
							if (sent) {
								await prisma.reminder.delete({
									where: {
										id: reminder.id,
									},
								});
							}
						} catch (error) {
							console.error(
								`❌ リマインダー送信失敗: ${reminder.id}`,
								error,
							);
						}
					}
				} catch (error) {
					console.error("❌ リマインダー取得失敗", error);
				}
			};

			// 起動直後に一度実行
			await processReminders();

			// 10秒ごとにチェック
			setInterval(processReminders, REMINDER_CHECK_INTERVAL);
		}

		// ======================
		// Webhook（Shard 0のみ）
		// ======================
		if (shardId === 0) {
			setTimeout(async () => {
				try {
					await sendBotOnlineStatus(client);
				} catch (e) {
					console.error("❌ Webhook送信失敗", e);
				}
			}, 5000);
		}

		// ======================
		// Presence更新
		// ======================
		const updatePresence = async () => {
			try {
				await updateGlobalPresence(client);
			} catch (e) {
				console.error("❌ Presence更新失敗", e);
			}
		};

		setTimeout(async () => {
			await updatePresence();
			setInterval(updatePresence, 30000);
		}, 10000);
	},
};

export default event;
