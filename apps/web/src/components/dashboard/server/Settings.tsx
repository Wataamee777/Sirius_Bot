"use client";

import {
	Alert,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Snackbar,
} from "@mui/material";
import { useMemo, useState } from "react";
import { saveGuildSettings } from "@/lib/actions";
import { normalizeAutoReactions } from "@/lib/autoReactions";
import DashboardGrid from "../DashboardGrid";
import AutoReact from "./settings/AutoReact";
import EarthquakeNotify from "./settings/EarthquakeNotify";
import Honeypot from "./settings/Honeypot";
import InviteBlock from "./settings/InviteBlock";
import SpamBlock from "./settings/SpamBlock";
import type { GuildMetadata, GuildSettings } from "./settings/types";

type ModuleId = "spam" | "invite" | "honeypot" | "autoreact" | "earthquake";

interface Props {
	guildId: string;
	metadata: GuildMetadata;
	initialSettings?: Partial<GuildSettings>;
}

export default function Settings({
	guildId,
	metadata,
	initialSettings = {},
}: Props) {
	const s = initialSettings;

	const [settings, setSettings] = useState<GuildSettings>({
		// データ保持
		dataRetentionEnabled: s.dataRetentionEnabled ?? false,

		// スパム・ブロック
		spamBlockEnabled: s.spamBlockEnabled ?? true,

		// 招待リンクブロック
		inviteBlockEnabled: s.inviteBlockEnabled ?? true,

		// 短縮URL・正規表現ブロック
		shortBlockEnabled: s.shortBlockEnabled ?? true,
		regexBlockEnabled: s.regexBlockEnabled ?? true,

		// レポートチャンネル
		spamReportChannelId: s.spamReportChannelId ?? "",
		inviteReportChannelId: s.inviteReportChannelId ?? "",
		shortReportChannelId: s.shortReportChannelId ?? "",
		regexReportChannelId: s.regexReportChannelId ?? "",

		// スパム除外
		spamIgnoredRoles: s.spamIgnoredRoles ?? "",
		spamIgnoredChannels: s.spamIgnoredChannels ?? "",

		// 招待リンク除外
		inviteIgnoredRoles: s.inviteIgnoredRoles ?? "",
		inviteIgnoredChannels: s.inviteIgnoredChannels ?? "",

		// 短縮URL除外
		shortIgnoredRoles: s.shortIgnoredRoles ?? "",
		shortIgnoredChannels: s.shortIgnoredChannels ?? "",

		// 正規表現除外
		regexIgnoredRoles: s.regexIgnoredRoles ?? "",
		regexIgnoredChannels: s.regexIgnoredChannels ?? "",

		// ハニーポット
		honeypotEnabled: s.honeypotEnabled ?? false,
		honeypotChannelId: s.honeypotChannelId ?? "",
		honeypotReportId: s.honeypotReportId ?? "",
		honeypotIgnoreRole: s.honeypotIgnoreRole ?? "",

		// 自動リアクション
		autoReactions: normalizeAutoReactions(s.autoReactions),

		// 地震通知
		earthquakeNotifyEnabled: s.earthquakeNotifyEnabled ?? false,
		earthquakeChannelId: s.earthquakeChannelId ?? "",
		earthquakeNotifyRoles: s.earthquakeNotifyRoles ?? "",
		earthquakeNotifyScale: s.earthquakeNotifyScale ?? 1,

		// 参加・退出通知
		joinLeaveNotificationEnabled: s.joinLeaveNotificationEnabled ?? false,

		// メンション読み上げ
		mentionReadoutEnabled: s.mentionReadoutEnabled ?? false,
		mentionReadoutNameOnly: s.mentionReadoutNameOnly ?? false,
		mentionReadoutVolume: s.mentionReadoutVolume ?? 50,

		// 正規表現パターン
		regexPatterns: s.regexPatterns ?? "",
	});

	const [activeModule, setActiveModule] = useState<ModuleId | null>(null);

	const [saving, setSaving] = useState(false);

	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error";
	}>({
		open: false,
		message: "",
		severity: "success",
	});

	const modules = useMemo(
		() => [
			{
				id: "spam",
				title: "スパムブロック",
				description: "大量メッセージを自動検知",
			},
			{
				id: "invite",
				title: "招待リンクブロック",
				description: "Discord招待リンクを削除",
			},
			{
				id: "honeypot",
				title: "ハニーポット",
				description: "送信者を自動BAN",
			},
			{
				id: "autoreact",
				title: "自動リアクション",
				description: "メッセージへ自動リアクション",
			},
			{
				id: "earthquake",
				title: "地震情報通知",
				description: "地震情報と緊急地震速報を通知",
			},
		],
		[],
	);

	const updateSetting = <K extends keyof GuildSettings>(
		key: K,
		value: GuildSettings[K],
	) => {
		setSettings((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const handleToggle = (key: keyof GuildSettings) => {
		setSettings((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	const handleSave = async () => {
		try {
			setSaving(true);

			const result = await saveGuildSettings(guildId, "all", {
				...settings,
				autoReactions: JSON.stringify(settings.autoReactions),
			});

			if (!result.success) {
				throw new Error(result.error ?? "保存に失敗しました");
			}

			setSnackbar({
				open: true,
				message: "保存しました",
				severity: "success",
			});

			setActiveModule(null);
		} catch (error) {
			console.error("Failed to save guild settings:", error);

			setSnackbar({
				open: true,
				message: "保存に失敗しました",
				severity: "error",
			});
		} finally {
			setSaving(false);
		}
	};

	const renderModule = () => {
		switch (activeModule) {
			case "spam":
				return (
					<SpamBlock
						settings={settings}
						metadata={metadata}
						onToggle={handleToggle}
						onChange={updateSetting}
					/>
				);

			case "invite":
				return (
					<InviteBlock
						settings={settings}
						metadata={metadata}
						onToggle={handleToggle}
						onChange={updateSetting}
					/>
				);

			case "honeypot":
				return (
					<Honeypot
						settings={settings}
						metadata={metadata}
						onToggle={handleToggle}
						onChange={updateSetting}
					/>
				);

			case "autoreact":
				return (
					<AutoReact
						reactions={settings.autoReactions}
						channels={metadata.channels}
						onChange={(reactions) => updateSetting("autoReactions", reactions)}
					/>
				);

			case "earthquake":
				return (
					<EarthquakeNotify
						settings={settings}
						metadata={metadata}
						onToggle={handleToggle}
						onChange={updateSetting}
					/>
				);

			default:
				return null;
		}
	};

	return (
		<>
			<DashboardGrid
				modules={modules}
				onClick={(id) => setActiveModule(id as ModuleId)}
			/>

			<Dialog
				open={!!activeModule}
				onClose={() => setActiveModule(null)}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>
					{modules.find((m) => m.id === activeModule)?.title}
				</DialogTitle>

				<DialogContent>{renderModule()}</DialogContent>

				<DialogActions>
					<Button onClick={() => setActiveModule(null)} disabled={saving}>
						キャンセル
					</Button>

					<Button variant="contained" onClick={handleSave} disabled={saving}>
						{saving ? <CircularProgress size={20} /> : "保存"}
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={() =>
					setSnackbar((prev) => ({
						...prev,
						open: false,
					}))
				}
			>
				<Alert severity={snackbar.severity}>{snackbar.message}</Alert>
			</Snackbar>
		</>
	);
}
