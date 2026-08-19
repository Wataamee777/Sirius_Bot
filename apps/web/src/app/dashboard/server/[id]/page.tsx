import { prisma } from "@sirius/database";
import { redirect } from "next/navigation";
import ServerSettingsPage from "@/components/dashboard/server/ServerSettingsPage";
import { getSessionWithToken } from "@/lib/auth";
import { normalizeAutoReactions } from "@/lib/autoReactions";
import { BACKEND_URL } from "@/lib/constants";
import { checkAdminPermission } from "@/lib/isadmin";

async function getGuildMetadata(guildId: string) {
	const fallback = { channels: [], roles: [] };

	try {
		const res = await fetch(`${BACKEND_URL}/api/guilds/${guildId}/metadata`, {
			cache: "no-store",
		});

		if (!res.ok) return fallback;

		// 💡 テキストとして一度受け取る（空レスポンス対策）
		const text = await res.text();
		if (!text || text.trim() === "") {
			console.warn(`[getGuildMetadata] Empty response for guild: ${guildId}`);
			return fallback;
		}

		// 💡 安全にJSONパースを試みる
		try {
			return JSON.parse(text);
		} catch (parseError) {
			console.error(
				`[getGuildMetadata] JSON parse error for guild: ${guildId}`,
				parseError,
			);
			return fallback;
		}
	} catch (error) {
		console.error(`[getGuildMetadata] Fetch network error:`, error);
		return fallback;
	}
}

export default async function SettingsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	// 1. 認証 & 権限チェック
	const session = await getSessionWithToken();
	if (!session?.user) redirect("/login");

	const hasPermission = await checkAdminPermission(id);
	if (!hasPermission) redirect("/dashboard/server");

	// 2. データ取得
	const [settings, metadata] = await Promise.all([
		prisma.serverSetting.findUnique({ where: { serverId: id } }),
		getGuildMetadata(id),
	]);

	// 3. metadata の安全化
	const safeMetadata = {
		channels:
			metadata && Array.isArray(metadata.channels) ? metadata.channels : [],
		roles: metadata && Array.isArray(metadata.roles) ? metadata.roles : [],
	};

	// 4. settings 内の null を安全な初期値にコンバート
	// ※文字列としてカンマ区切りで入っているものは空文字 "", 配列（JSON）は空配列 [] にします
	const safeSettings = settings
		? {
				...settings,
				// 配列（JSON型）想定のもの
				autoReactions: normalizeAutoReactions(
					(settings as typeof settings & { autoReactions?: unknown })
						.autoReactions,
				),

				// カンマ区切りの文字列想定のもの（.split(',') で落ちないように空文字にする）
				inviteIgnoredChannels:
					(
						settings as typeof settings & {
							inviteIgnoredChannels?: string | null;
						}
					).inviteIgnoredChannels ?? "",
				inviteIgnoredRoles:
					(settings as typeof settings & { inviteIgnoredRoles?: string | null })
						.inviteIgnoredRoles ?? "",
				spamIgnoredChannels:
					(
						settings as typeof settings & {
							spamIgnoredChannels?: string | null;
						}
					).spamIgnoredChannels ?? "",
				spamIgnoredRoles:
					(settings as typeof settings & { spamIgnoredRoles?: string | null })
						.spamIgnoredRoles ?? "",
				ignoredChannels:
					(settings as typeof settings & { ignoredChannels?: string | null })
						.ignoredChannels ?? "",
				ignoredRoles:
					(settings as typeof settings & { ignoredRoles?: string | null })
						.ignoredRoles ?? "",
				// カンマ区切り文字列
				shortIgnoredChannels:
					(
						settings as typeof settings & {
							shortIgnoredChannels?: string | null;
						}
					).shortIgnoredChannels ?? "",

				shortIgnoredRoles:
					(
						settings as typeof settings & {
							shortIgnoredRoles?: string | null;
						}
					).shortIgnoredRoles ?? "",

				regexIgnoredChannels:
					(
						settings as typeof settings & {
							regexIgnoredChannels?: string | null;
						}
					).regexIgnoredChannels ?? "",

				regexIgnoredRoles:
					(
						settings as typeof settings & {
							regexIgnoredRoles?: string | null;
						}
					).regexIgnoredRoles ?? "",

				// JSON文字列
				regexPatterns:
					(
						settings as typeof settings & {
							regexPatterns?: string | null;
						}
					).regexPatterns ?? "[]",

				// ID
				shortReportChannelId:
					(
						settings as typeof settings & {
							shortReportChannelId?: string | null;
						}
					).shortReportChannelId ?? "",

				regexReportChannelId:
					(
						settings as typeof settings & {
							regexReportChannelId?: string | null;
						}
					).regexReportChannelId ?? "",
				// その他の文字列・ID系
				inviteReportChannelId:
					(
						settings as typeof settings & {
							inviteReportChannelId?: string | null;
						}
					).inviteReportChannelId ?? "",
				spamReportChannelId:
					(
						settings as typeof settings & {
							spamReportChannelId?: string | null;
						}
					).spamReportChannelId ?? "",
				honeypotReportId:
					(settings as typeof settings & { honeypotReportId?: string | null })
						.honeypotReportId ?? "",
				honeypotIgnoreRole:
					(settings as typeof settings & { honeypotIgnoreRole?: string | null })
						.honeypotIgnoreRole ?? "",
				honeypotChannelId:
					(settings as typeof settings & { honeypotChannelId?: string | null })
						.honeypotChannelId ?? "",
				earthquakeNotifyEnabled:
					(settings as typeof settings & { earthquakeNotifyEnabled?: boolean })
						.earthquakeNotifyEnabled ?? false,
				earthquakeChannelId:
					(
						settings as typeof settings & {
							earthquakeChannelId?: string | null;
						}
					).earthquakeChannelId ?? "",
				earthquakeNotifyRoles:
					(
						settings as typeof settings & {
							earthquakeNotifyRole?: string | null;
							earthquakeNotifyRoles?: string | null;
						}
					).earthquakeNotifyRole ??
					(
						settings as typeof settings & {
							earthquakeNotifyRoles?: string | null;
						}
					).earthquakeNotifyRoles ??
					"",
				earthquakeNotifyScale: Number(
					(
						settings as typeof settings & {
							earthquakeNotifyScale?: number | null;
						}
					).earthquakeNotifyScale ?? 1,
				),
				joinLeaveNotificationEnabled:
					(
						settings as typeof settings & {
							joinLeaveNotificationEnabled?: boolean;
						}
					).joinLeaveNotificationEnabled ?? false,
				mentionReadoutEnabled:
					(settings as typeof settings & { mentionReadoutEnabled?: boolean })
						.mentionReadoutEnabled ?? false,
				mentionReadoutNameOnly:
					(settings as typeof settings & { mentionReadoutNameOnly?: boolean })
						.mentionReadoutNameOnly ?? false,
				mentionReadoutVolume: Number(
					(
						settings as typeof settings & {
							mentionReadoutVolume?: number | null;
						}
					).mentionReadoutVolume ?? 50,
				),
				dataRetentionEnabled:
					(settings as typeof settings & { dataRetentionEnabled?: boolean })
						.dataRetentionEnabled ?? false,
			}
		: undefined;

	return (
		<ServerSettingsPage
			guildId={id}
			initialSettings={safeSettings ?? undefined}
			metadata={safeMetadata}
		/>
	);
}
