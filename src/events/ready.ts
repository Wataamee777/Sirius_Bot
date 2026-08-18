import type { Client } from "discord.js";
import { Events } from "discord.js";
import { updateGlobalPresence } from "@/utils/presence";
import { sendBotOnlineStatus } from "@/utils/statusWebhook";

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

			let attempts = 0;
			const maxAttempts = 15;

			while (attempts < maxAttempts) {
				try {
					const statuses = await client.shard.broadcastEval((c) => c.ws.status);

					// 0 = READY
					if (statuses.every((s) => s === 0)) {
						return;
					}
				} catch (err) {
					console.warn(
						`⚠️ [Shard ${shardId}] broadcastEval ready check retry (${attempts + 1}/${maxAttempts})`,
					);
				}

				attempts++;
				await new Promise((r) => setTimeout(r, 2000));
			}

			console.warn(
				`⚠️ [Shard ${shardId}] 全シャード準備完了の確認がタイムアウトしました。処理を続行します。`,
			);
		};

		await waitForShardsReady();
		console.log("✅ 全シャード起動完了");

		// ======================
		// Webhook（shard0のみ）
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
