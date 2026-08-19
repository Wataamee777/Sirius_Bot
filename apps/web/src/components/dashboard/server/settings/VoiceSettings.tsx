"use client";

import {
	Alert,
	Box,
	FormControlLabel,
	Slider,
	Stack,
	Switch,
	Typography,
} from "@mui/material";
import type { GuildSettings } from "./types";

type Props = {
	settings: Partial<GuildSettings>;
	onToggle: (key: keyof GuildSettings) => void;
	onChange: <K extends keyof GuildSettings>(
		key: K,
		value: GuildSettings[K],
	) => void;
};

export default function VoiceSettings({ settings, onToggle, onChange }: Props) {
	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
			<FormControlLabel
				control={
					<Switch
						checked={settings.joinLeaveNotificationEnabled}
						onChange={() => onToggle("joinLeaveNotificationEnabled")}
					/>
				}
				label="入退出通知を有効化"
			/>

			<FormControlLabel
				control={
					<Switch
						checked={settings.mentionReadoutEnabled}
						onChange={() => onToggle("mentionReadoutEnabled")}
					/>
				}
				label="メンション読み上げを有効化"
			/>

			<FormControlLabel
				control={
					<Switch
						checked={settings.mentionReadoutNameOnly}
						onChange={() => onToggle("mentionReadoutNameOnly")}
					/>
				}
				label="名前のみ読み上げ"
			/>

			<Stack spacing={1}>
				<Typography variant="body2" color="text.secondary">
					読み上げ音量: {settings.mentionReadoutVolume ?? 50}
				</Typography>
				<Slider
					value={settings.mentionReadoutVolume ?? 50}
					onChange={(_, value) =>
						onChange("mentionReadoutVolume", value as number)
					}
					min={0}
					max={100}
					step={1}
					valueLabelDisplay="auto"
				/>
			</Stack>

			<Alert severity="info">
				入退出通知やメンション読み上げの設定は、サーバーの音声通知に反映されます。
			</Alert>
		</Box>
	);
}
