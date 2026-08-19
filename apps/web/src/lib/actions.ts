"use server";

import { prisma } from "@sirius/database";
import { revalidatePath } from "next/cache";
import { BACKEND_URL } from "@/lib/constants";

type GuildSettingPayload = {
	spamBlockEnabled?: boolean;
	inviteBlockEnabled?: boolean;
	spamReportChannelId?: string | null;
	inviteReportChannelId?: string | null;
	spamIgnoredRoles?: string;
	spamIgnoredChannels?: string;
	inviteIgnoredRoles?: string;
	inviteIgnoredChannels?: string;
	shortBlockEnabled?: boolean;
	regexBlockEnabled?: boolean;
	shortReportChannelId?: string | null;
	regexReportChannelId?: string | null;
	shortIgnoredRoles?: string;
	shortIgnoredChannels?: string;
	regexIgnoredRoles?: string;
	regexIgnoredChannels?: string;
	regexPatterns?: string;
	honeypotEnabled?: boolean;
	honeypotChannelId?: string | null;
	honeypotReportId?: string | null;
	honeypotIgnoreRole?: string | null;
	autoReactions?: string;
	earthquakeNotifyEnabled?: boolean;
	earthquakeChannelId?: string | null;
	earthquakeWebhookUrl?: string | null;
	earthquakeNotifyRole?: string | null;
	earthquakeNotifyRoles?: string | null;
	earthquakeNotifyScale?: number | null;
	joinLeaveNotificationEnabled?: boolean;
	mentionReadoutEnabled?: boolean;
	mentionReadoutNameOnly?: boolean;
	mentionReadoutVolume?: number;
	dataRetentionEnabled?: boolean;
};

const createEarthquakeWebhook = async (
	guildId: string,
	channelId: string,
): Promise<string | null> => {
	try {
		const res = await fetch(
			`${BACKEND_URL}/api/guilds/${guildId}/earthquake-webhook`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ channelId }),
				cache: "no-store",
			},
		);

		if (!res.ok) {
			console.error(
				`[Earthquake] Webhook creation failed: ${res.status} ${await res.text()}`,
			);
			return null;
		}

		const payload = (await res.json()) as { webhookUrl?: string };
		return payload.webhookUrl ?? null;
	} catch (error) {
		console.error("[Earthquake] Webhook creation error:", error);
		return null;
	}
};

export async function saveGuildSettings(
	guildId: string,
	category: string,
	data: GuildSettingPayload,
) {
	if (!guildId) {
		return { success: false, error: "Invalid data" };
	}

	try {
		const updateData: Record<string, unknown> = {};
		const saveAll = category === "all";

		if (saveAll || category === "moderation") {
			updateData.spamBlockEnabled = data.spamBlockEnabled;
			updateData.inviteBlockEnabled = data.inviteBlockEnabled;
			updateData.spamIgnoredRoles = data.spamIgnoredRoles;
			updateData.spamIgnoredChannels = data.spamIgnoredChannels;
			updateData.inviteIgnoredRoles = data.inviteIgnoredRoles;
			updateData.inviteIgnoredChannels = data.inviteIgnoredChannels;
			updateData.shortBlockEnabled = data.shortBlockEnabled;
			updateData.regexBlockEnabled = data.regexBlockEnabled;
			updateData.shortReportChannelId = data.shortReportChannelId;
			updateData.regexReportChannelId = data.regexReportChannelId;
			updateData.shortIgnoredRoles = data.shortIgnoredRoles;
			updateData.shortIgnoredChannels = data.shortIgnoredChannels;
			updateData.regexIgnoredRoles = data.regexIgnoredRoles;
			updateData.regexIgnoredChannels = data.regexIgnoredChannels;
			updateData.regexPatterns = data.regexPatterns;
			updateData.honeypotEnabled = data.honeypotEnabled;
			updateData.honeypotChannelId = data.honeypotChannelId;
			updateData.honeypotReportId = data.honeypotReportId;
			updateData.honeypotIgnoreRole = data.honeypotIgnoreRole;
		}

		if (saveAll || category === "notifications" || category === "voice") {
			updateData.spamReportChannelId = data.spamReportChannelId;
			updateData.inviteReportChannelId = data.inviteReportChannelId;
			updateData.joinLeaveNotificationEnabled =
				data.joinLeaveNotificationEnabled;
			updateData.mentionReadoutEnabled = data.mentionReadoutEnabled;
			updateData.mentionReadoutNameOnly = data.mentionReadoutNameOnly;
			updateData.mentionReadoutVolume = data.mentionReadoutVolume;
		}

		if (
			saveAll ||
			category === "convenience" ||
			category === "earthquake" ||
			category === "autoreact"
		) {
			updateData.autoReactions = data.autoReactions;
			updateData.earthquakeNotifyRole =
				data.earthquakeNotifyRole ?? data.earthquakeNotifyRoles;
			updateData.earthquakeNotifyEnabled = data.earthquakeNotifyEnabled;
			updateData.earthquakeNotifyScale = data.earthquakeNotifyScale;

			if (data.earthquakeNotifyEnabled) {
				if (!data.earthquakeChannelId) {
					return {
						success: false,
						error: "地震情報通知を有効にするにはチャンネルを選択してください",
					};
				}

				const existing = await prisma.serverSetting.findUnique({
					where: { serverId: guildId },
					select: {
						earthquakeChannelId: true,
						earthquakeWebhookUrl: true,
					},
				});

				const channelChanged =
					existing?.earthquakeChannelId !== data.earthquakeChannelId;
				const needsWebhook =
					channelChanged || !existing?.earthquakeWebhookUrl?.trim();

				let webhookUrl = existing?.earthquakeWebhookUrl ?? null;
				if (needsWebhook) {
					webhookUrl = await createEarthquakeWebhook(
						guildId,
						data.earthquakeChannelId,
					);
					if (!webhookUrl) {
						return {
							success: false,
							error:
								"Webhookの作成に失敗しました。Botの権限（Webhook管理）を確認してください",
						};
					}
				}

				updateData.earthquakeChannelId = data.earthquakeChannelId;
				updateData.earthquakeWebhookUrl = webhookUrl;
			} else {
				updateData.earthquakeNotifyEnabled = false;
			}
		}

		if (saveAll || category === "data" || category === "dataretention") {
			updateData.dataRetentionEnabled = data.dataRetentionEnabled;
		}

		// Clean undefined keys
		const cleanUpdateData = Object.fromEntries(
			Object.entries(updateData).filter(([, v]) => v !== undefined),
		);

		await prisma.serverSetting.upsert({
			where: {
				serverId: guildId,
			},
			update: cleanUpdateData,
			create: {
				serverId: guildId,
				spamBlockEnabled: data.spamBlockEnabled ?? true,
				inviteBlockEnabled: data.inviteBlockEnabled ?? true,
				shortBlockEnabled: data.shortBlockEnabled ?? true,
				regexBlockEnabled: data.regexBlockEnabled ?? false,
				spamReportChannelId: data.spamReportChannelId ?? null,
				inviteReportChannelId: data.inviteReportChannelId ?? null,
				shortReportChannelId: data.shortReportChannelId ?? null,
				regexReportChannelId: data.regexReportChannelId ?? null,
				spamIgnoredRoles: data.spamIgnoredRoles ?? null,
				spamIgnoredChannels: data.spamIgnoredChannels ?? null,
				inviteIgnoredRoles: data.inviteIgnoredRoles ?? null,
				inviteIgnoredChannels: data.inviteIgnoredChannels ?? null,
				shortIgnoredRoles: data.shortIgnoredRoles ?? null,
				shortIgnoredChannels: data.shortIgnoredChannels ?? null,
				regexIgnoredRoles: data.regexIgnoredRoles ?? null,
				regexIgnoredChannels: data.regexIgnoredChannels ?? null,
				regexPatterns: data.regexPatterns ?? null,
				honeypotEnabled: data.honeypotEnabled ?? false,
				honeypotChannelId: data.honeypotChannelId ?? null,
				honeypotReportId: data.honeypotReportId ?? null,
				honeypotIgnoreRole: data.honeypotIgnoreRole ?? null,
				autoReactions: data.autoReactions ?? null,
				earthquakeNotifyEnabled: data.earthquakeNotifyEnabled ?? false,
				earthquakeChannelId: data.earthquakeChannelId ?? null,
				earthquakeWebhookUrl:
					(cleanUpdateData.earthquakeWebhookUrl as string | null) ?? null,
				earthquakeNotifyRole:
					data.earthquakeNotifyRole ?? data.earthquakeNotifyRoles ?? null,
				earthquakeNotifyScale: data.earthquakeNotifyScale ?? null,
				joinLeaveNotificationEnabled:
					data.joinLeaveNotificationEnabled ?? false,
				mentionReadoutEnabled: data.mentionReadoutEnabled ?? false,
				mentionReadoutNameOnly: data.mentionReadoutNameOnly ?? false,
				mentionReadoutVolume: data.mentionReadoutVolume ?? 50,
			},
		});

		revalidatePath(`/mypage/guild/${guildId}`);
		revalidatePath(`/dashboard/server/${guildId}`);

		return { success: true };
	} catch (error) {
		console.error("[Prisma Error] saveGuildSettings:", error);
		throw new Error("設定の保存に失敗しました。");
	}
}

export async function getGuildSettings(guildId: string) {
	if (!guildId) return null;
	return await prisma.serverSetting.findUnique({
		where: {
			serverId: guildId,
		},
	});
}
