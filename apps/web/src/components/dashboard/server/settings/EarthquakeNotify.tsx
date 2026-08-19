"use client";

import type { SelectChangeEvent } from "@mui/material";
import {
	Alert,
	Box,
	FormControl,
	FormControlLabel,
	InputLabel,
	MenuItem,
	Select,
	Switch,
} from "@mui/material";
import ChannelSelect from "@/components/dashboard/server/settings/ui/ChannelSelect";
import RoleSelect from "@/components/dashboard/server/settings/ui/RoleSelect";
import type { GuildMetadata, GuildSettings } from "./types";

type Props = {
	settings: Partial<GuildSettings>;
	metadata: GuildMetadata;
	onToggle: (key: keyof GuildSettings) => void;
	onChange: <K extends keyof GuildSettings>(
		key: K,
		value: GuildSettings[K],
	) => void;
};

export default function EarthquakeNotify({
	settings,
	metadata,
	onToggle,
	onChange,
}: Props) {
	const isEnabled = !!settings.earthquakeNotifyEnabled;
	const needsChannel = isEnabled && !settings.earthquakeChannelId;

	const handleScaleChange = (event: SelectChangeEvent<number | "">) => {
		const val = event.target.value;
		if (val !== "") {
			onChange("earthquakeNotifyScale", val as number);
		}
	};

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
			<FormControlLabel
				control={
					<Switch
						checked={isEnabled}
						onChange={() => onToggle("earthquakeNotifyEnabled")}
					/>
				}
				label="地震情報通知を有効化"
			/>

			<FormControl fullWidth disabled={!isEnabled}>
				<InputLabel id="earthquakeNotifyScale-label">
					通知する震度を設定
				</InputLabel>
				<Select
					labelId="earthquakeNotifyScale-label"
					id="earthquakeNotifyScale-select"
					value={settings.earthquakeNotifyScale ?? ""}
					label="通知する震度を設定"
					onChange={handleScaleChange}
				>
					<MenuItem value={9}>震度7</MenuItem>
					<MenuItem value={8}>震度6強以上</MenuItem>
					<MenuItem value={7}>震度6弱以上</MenuItem>
					<MenuItem value={6}>震度5強以上</MenuItem>
					<MenuItem value={5}>震度5弱以上</MenuItem>
					<MenuItem value={4}>震度4以上</MenuItem>
					<MenuItem value={3}>震度3以上</MenuItem>
					<MenuItem value={2}>震度2以上</MenuItem>
					<MenuItem value={1}>震度1以上</MenuItem>
				</Select>
			</FormControl>

			<RoleSelect
				label="通知ロール"
				value={settings.earthquakeNotifyRoles ?? ""}
				roles={metadata.roles}
				onChange={(v) => onChange("earthquakeNotifyRoles", v)}
				disabled={!isEnabled}
			/>

			<ChannelSelect
				label="通知チャンネル"
				value={settings.earthquakeChannelId ?? ""}
				channels={metadata.channels}
				onChange={(v) => onChange("earthquakeChannelId", v)}
				disabled={!isEnabled}
			/>

			{needsChannel && (
				<Alert severity="warning">
					通知を有効にするにはチャンネルを選択してください。保存時にWebhookが作成されます。
				</Alert>
			)}

			<Alert severity="info">
				保存すると選択したチャンネルにWebhookが作成され、地震情報と緊急地震速報が通知されます。
				発生・発表時刻が現在時刻から30秒以上離れている情報は通知されません。
			</Alert>
		</Box>
	);
}
