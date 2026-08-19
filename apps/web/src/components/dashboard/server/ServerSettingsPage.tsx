"use client";

import CloseIcon from "@mui/icons-material/Close";
import {
	Alert,
	Box,
	Button,
	Card,
	CardActionArea,
	CardContent,
	CircularProgress,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	Snackbar,
	Stack,
	Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { saveGuildSettings } from "@/lib/actions";
import { normalizeAutoReactions } from "@/lib/autoReactions";
import AutoReact from "./settings/AutoReact";
import DataRetention from "./settings/DataRetention";
import EarthquakeNotify from "./settings/EarthquakeNotify";
import Honeypot from "./settings/Honeypot";
import InviteBlock from "./settings/InviteBlock";
import RegexBlock from "./settings/RegexBlock";
import ShortBlock from "./settings/ShortBlock";
import SpamBlock from "./settings/SpamBlock";
import VoiceSettings from "./settings/VoiceSettings";

type MetadataItem = {
	id: string;
	name: string;
};

type GuildMetadata = {
	channels: MetadataItem[];
	roles: MetadataItem[];
};

type ModuleId =
	| "spam"
	| "invite"
	| "honeypot"
	| "autoreact"
	| "earthquake"
	| "voice"
	| "short"
	| "regex"
	| "dataretention";

type SettingsState = {
	spamBlockEnabled: boolean;
	spamReportChannelId: string;
	spamIgnoredRoles: string;
	spamIgnoredChannels: string;
	inviteBlockEnabled: boolean;
	inviteReportChannelId: string;
	inviteIgnoredRoles: string;
	inviteIgnoredChannels: string;
	shortBlockEnabled: boolean;
	shortReportChannelId: string;
	shortIgnoredRoles: string;
	shortIgnoredChannels: string;
	regexBlockEnabled: boolean;
	regexReportChannelId: string;
	regexIgnoredRoles: string;
	regexIgnoredChannels: string;
	honeypotEnabled: boolean;
	honeypotChannelId: string;
	honeypotReportId: string;
	honeypotIgnoreRole: string;
	autoReactions: { channelId: string; emoji: string }[];
	earthquakeNotifyEnabled: boolean;
	earthquakeChannelId: string;
	earthquakeNotifyRoles: string;
	earthquakeNotifyScale: number;
	joinLeaveNotificationEnabled: boolean;
	mentionReadoutEnabled: boolean;
	mentionReadoutNameOnly: boolean;
	mentionReadoutVolume: number;
	regexPatterns: string;
	dataRetentionEnabled: boolean;
};

const createSettingsState = (
	source?: Partial<SettingsState>,
): SettingsState => ({
	spamBlockEnabled: source?.spamBlockEnabled ?? false,
	spamReportChannelId: source?.spamReportChannelId ?? "",
	spamIgnoredRoles: source?.spamIgnoredRoles ?? "",
	spamIgnoredChannels: source?.spamIgnoredChannels ?? "",

	inviteBlockEnabled: source?.inviteBlockEnabled ?? false,
	inviteReportChannelId: source?.inviteReportChannelId ?? "",
	inviteIgnoredRoles: source?.inviteIgnoredRoles ?? "",
	inviteIgnoredChannels: source?.inviteIgnoredChannels ?? "",

	shortBlockEnabled: source?.shortBlockEnabled ?? false,
	shortReportChannelId: source?.shortReportChannelId ?? "",
	shortIgnoredRoles: source?.shortIgnoredRoles ?? "",
	shortIgnoredChannels: source?.shortIgnoredChannels ?? "",

	regexBlockEnabled: source?.regexBlockEnabled ?? false,
	regexReportChannelId: source?.regexReportChannelId ?? "",
	regexIgnoredRoles: source?.regexIgnoredRoles ?? "",
	regexIgnoredChannels: source?.regexIgnoredChannels ?? "",

	honeypotEnabled: source?.honeypotEnabled ?? false,
	honeypotChannelId: source?.honeypotChannelId ?? "",
	honeypotReportId: source?.honeypotReportId ?? "",
	honeypotIgnoreRole: source?.honeypotIgnoreRole ?? "",

	autoReactions: normalizeAutoReactions(source?.autoReactions),
	earthquakeNotifyEnabled: source?.earthquakeNotifyEnabled ?? false,
	earthquakeChannelId: source?.earthquakeChannelId ?? "",
	earthquakeNotifyRoles: source?.earthquakeNotifyRoles ?? "",
	earthquakeNotifyScale: Number(source?.earthquakeNotifyScale ?? ""),
	joinLeaveNotificationEnabled: source?.joinLeaveNotificationEnabled ?? false,
	mentionReadoutEnabled: source?.mentionReadoutEnabled ?? false,
	mentionReadoutNameOnly: source?.mentionReadoutNameOnly ?? false,
	mentionReadoutVolume: Number(source?.mentionReadoutVolume ?? 50),
	regexPatterns: source?.regexPatterns ?? "[]",
	dataRetentionEnabled: source?.dataRetentionEnabled ?? false,
});

interface Props {
	guildId: string;
	metadata: GuildMetadata;
	initialSettings?: Partial<SettingsState>;
}

export default function ServerSettingsPage({
	guildId,
	metadata,
	initialSettings,
}: Props) {
	const [settings, setSettings] = useState<SettingsState>(() =>
		createSettingsState(initialSettings),
	);
	const [initialSettingsSnapshot, setInitialSettingsSnapshot] =
		useState<SettingsState>(() => createSettingsState(initialSettings));

	const [activeModule, setActiveModule] = useState<ModuleId | null>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [saving, setSaving] = useState(false);

	const [snackbar, setSnackbar] = useState({
		open: false,
		severity: "success" as "success" | "error",
		message: "",
	});

	const modules = useMemo(
		() => [
			{
				id: "spam",
				title: "スパムブロック",
				description: "メッセージの異常な増加を検知して制御します",
				group: "management",
			},
			{
				id: "invite",
				title: "招待リンクブロック",
				description: "招待リンクの送信を自動で検出して制限します",
				group: "management",
			},
			{
				id: "short",
				title: "短縮リンクブロック",
				description: "独自のリストから短縮リンクを検知し制御します",
				group: "management",
			},
			{
				id: "regex",
				title: "正規表現ブロック",
				description: "正規表現で細かにブロック内容を複数設定します",
				group: "management",
			},
			{
				id: "honeypot",
				title: "ハニーポット",
				description: "不正な送信者を検知して対応します",
				group: "management",
			},
			{
				id: "autoreact",
				title: "自動リアクション",
				description: "メッセージに自動で絵文字リアクションを付けます",
				group: "convenience",
			},
			{
				id: "earthquake",
				title: "地震情報通知",
				description: "地震情報と緊急地震速報を自動通知します",
				group: "convenience",
			},
			{
				id: "voice",
				title: "入退出・読み上げ通知",
				description: "入退出通知やメンション読み上げの設定を行います",
				group: "convenience",
			},
			{
				id: "dataretention",
				title: "サーバーデータの保存",
				description: "メッセージログや操作履歴などのデータ保存を管理します",
				group: "data",
			},
		],
		[],
	);

	const moduleGroups = useMemo(
		() => [
			{
				id: "management",
				title: "管理機能",
				description: "サーバーの安全性を保つための設定です",
				modules: modules.filter((module) => module.group === "management"),
			},
			{
				id: "convenience",
				title: "便利機能",
				description: "運用を快適にするための設定です",
				modules: modules.filter((module) => module.group === "convenience"),
			},
			{
				id: "data",
				title: "データ管理",
				description: "サーバーデータの収集・保存に関する設定です",
				modules: modules.filter((module) => module.group === "data"),
			},
		],
		[modules],
	);

	const activeModuleMeta = modules.find((module) => module.id === activeModule);
	const isDirty = useMemo(() => {
		return JSON.stringify(settings) !== JSON.stringify(initialSettingsSnapshot);
	}, [settings, initialSettingsSnapshot]);

	const closeModule = () => {
		setActiveModule(null);
		setConfirmOpen(false);
	};

	const requestCloseModule = () => {
		if (isDirty) {
			setConfirmOpen(true);
			return;
		}

		closeModule();
	};

	const updateSetting = <K extends keyof SettingsState>(
		key: K,
		value: SettingsState[K],
	) => {
		setSettings((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const handleToggle = (key: keyof SettingsState) => {
		setSettings((prev) => ({
			...prev,
			[key]: !prev[key as keyof typeof prev],
		}));
	};

	const handleSave = async () => {
		setSaving(true);

		try {
			const result = await saveGuildSettings(guildId, "all", {
				...settings,
				autoReactions: JSON.stringify(settings.autoReactions),
			});

			if (result.success) {
				setInitialSettingsSnapshot(settings);
				setSnackbar({
					open: true,
					severity: "success",
					message: "設定を保存しました",
				});
			} else {
				setSnackbar({
					open: true,
					severity: "error",
					message: result.error ?? "保存に失敗しました",
				});
			}
		} catch {
			setSnackbar({
				open: true,
				severity: "error",
				message: "保存中にエラーが発生しました",
			});
		} finally {
			setSaving(false);
		}
	};

	const safeChannels = Array.isArray(metadata?.channels)
		? metadata.channels
		: [];
	const safeRoles = Array.isArray(metadata?.roles) ? metadata.roles : [];
	const safeReactions = Array.isArray(settings.autoReactions)
		? settings.autoReactions
		: [];

	const safeMetadata = { channels: safeChannels, roles: safeRoles };

	const renderModule = () => {
		switch (activeModule) {
			case "spam":
				return (
					<SpamBlock
						settings={settings}
						metadata={safeMetadata}
						onToggle={handleToggle}
						onChange={updateSetting}
					/>
				);

			case "invite":
				return (
					<InviteBlock
						settings={settings}
						metadata={safeMetadata}
						onToggle={handleToggle}
						onChange={updateSetting}
					/>
				);

			case "short":
				return (
					<ShortBlock
						settings={settings}
						metadata={safeMetadata}
						onToggle={handleToggle}
						onChange={updateSetting}
					/>
				);

			case "regex":
				return (
					<RegexBlock
						settings={settings}
						metadata={safeMetadata}
						onToggle={handleToggle}
						onChange={updateSetting}
					/>
				);

			case "honeypot":
				return (
					<Honeypot
						settings={settings}
						metadata={safeMetadata}
						onToggle={handleToggle}
						onChange={updateSetting}
					/>
				);

			case "autoreact":
				return (
					<AutoReact
						reactions={safeReactions}
						channels={safeChannels}
						onChange={(reactions) => updateSetting("autoReactions", reactions)}
					/>
				);

			case "earthquake":
				return (
					<EarthquakeNotify
						settings={settings}
						metadata={safeMetadata}
						onToggle={handleToggle}
						onChange={updateSetting}
					/>
				);

			case "voice":
				return (
					<VoiceSettings
						settings={settings}
						onToggle={handleToggle}
						onChange={updateSetting}
					/>
				);

			case "dataretention":
				return <DataRetention settings={settings} onToggle={handleToggle} />;

			default:
				return null;
		}
	};

	return (
		<Container maxWidth="lg">
			<Stack spacing={3}>
				<Box>
					<Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
						サーバー設定
					</Typography>
					<Typography color="text.secondary">
						管理機能と便利機能を分けて、必要な機能だけを選んで設定できます。
					</Typography>
				</Box>

				{moduleGroups.map((group) => (
					<Box key={group.id}>
						<Typography variant="h6" gutterBottom>
							{group.title}
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
							{group.description}
						</Typography>
						<Stack direction={{ xs: "column", md: "row" }} spacing={2}>
							{group.modules.map((module) => (
								<Card key={module.id} sx={{ flex: 1, minHeight: 140 }}>
									<CardActionArea
										onClick={() => setActiveModule(module.id as ModuleId)}
										sx={{ height: "100%" }}
										aria-haspopup="dialog"
										aria-controls="module-dialog"
									>
										<CardContent>
											<Typography variant="h6">{module.title}</Typography>
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{ mt: 1 }}
											>
												{module.description}
											</Typography>
										</CardContent>
									</CardActionArea>
								</Card>
							))}
						</Stack>
					</Box>
				))}

				<Box
					sx={{
						display: "flex",
						justifyContent: "flex-end",
					}}
				>
					<Button
						variant="contained"
						size="large"
						onClick={handleSave}
						disabled={saving}
					>
						{saving ? "保存中..." : "設定を保存"}
					</Button>
				</Box>
			</Stack>

			<Dialog
				id="module-dialog"
				open={!!activeModule}
				onClose={requestCloseModule}
				aria-labelledby="module-dialog-title"
				aria-describedby="module-dialog-description"
				maxWidth="md"
				fullWidth
			>
				<DialogTitle
					id="module-dialog-title"
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<span>{activeModuleMeta?.title ?? "機能設定"}</span>
					<IconButton
						aria-label="閉じる"
						onClick={requestCloseModule}
						size="small"
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>

				<DialogContent>
					{activeModuleMeta?.description && (
						<Typography
							id="module-dialog-description"
							color="text.secondary"
							sx={{ mb: 2 }}
						>
							{activeModuleMeta.description}
						</Typography>
					)}
					{renderModule()}
				</DialogContent>

				<DialogActions>
					<Button onClick={requestCloseModule}>キャンセル</Button>
					<Button variant="contained" onClick={handleSave} disabled={saving}>
						{saving ? <CircularProgress size={20} color="inherit" /> : "保存"}
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={confirmOpen}
				onClose={() => setConfirmOpen(false)}
				maxWidth="xs"
				fullWidth
			>
				<DialogTitle>保存しなくてよろしいですか</DialogTitle>
				<DialogContent>
					<Typography color="text.secondary">
						変更内容は破棄されます。よろしいですか？
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setConfirmOpen(false)}>いいえ</Button>
					<Button variant="contained" color="warning" onClick={closeModule}>
						はい
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
		</Container>
	);
}
