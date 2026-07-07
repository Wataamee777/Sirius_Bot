import type { APIEmbed } from "discord.js";
import { WebhookClient } from "discord.js";

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
): Promise<string | null> => {
	const client = getWebhookClient(webhookUrl);

	try {
		if (typeof messageId === "string" && messageId.length > 0) {
			try {
				await client.editMessage(messageId, { embeds: [embed] });
				return messageId;
			} catch {
				const sent = await client.send({ embeds: [embed] });
				return sent.id;
			}
		}

		const sent = await client.send({ embeds: [embed] });
		return sent.id;
	} catch (error) {
		console.error("❌ 地震通知Webhook送信失敗", error);
		return null;
	}
};
