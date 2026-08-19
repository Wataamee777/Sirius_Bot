import type { APIEmbed } from "discord.js";
import { DiscordAPIError, WebhookClient } from "discord.js";

const webhookClients = new Map<string, WebhookClient>();

const getWebhookClient = (webhookUrl: string): WebhookClient => {
	const existing = webhookClients.get(webhookUrl);
	if (existing) {
		return existing;
	}

	const client = new WebhookClient({ url: webhookUrl });
	webhookClients.set(webhookUrl, client);
	return client;
};

export const sendEarthquakeWebhook = async (
	webhookUrl: string,
	embed: APIEmbed,
	messageId?: string | null,
): Promise<{ messageId: string | null; missingWebhook: boolean }> => {
	const client = getWebhookClient(webhookUrl);

	try {
		if (typeof messageId === "string" && messageId.length > 0) {
			try {
				await client.editMessage(messageId, { embeds: [embed] });
				return { messageId, missingWebhook: false };
			} catch {
				const sent = await client.send({ embeds: [embed] });
				return { messageId: sent.id, missingWebhook: false };
			}
		}

		const sent = await client.send({ embeds: [embed] });
		return { messageId: sent.id, missingWebhook: false };
	} catch (error) {
		if (error instanceof DiscordAPIError && error.code === 10015) {
			webhookClients.delete(webhookUrl);
			return { messageId: null, missingWebhook: true };
		}

		console.error("❌ 地震通知Webhook送信失敗", error);
		return { messageId: null, missingWebhook: false };
	}
};
