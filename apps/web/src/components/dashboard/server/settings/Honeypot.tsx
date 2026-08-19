"use client";

import { Box, FormControlLabel, Switch } from "@mui/material";
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

export default function Honeypot({
	settings,
	metadata,
	onToggle,
	onChange,
}: Props) {
	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
			<FormControlLabel
				control={
					<Switch
						checked={settings.honeypotEnabled}
						onChange={() => onToggle("honeypotEnabled")}
					/>
				}
				label="ハニーポットを有効化"
			/>

			<ChannelSelect
				label="対象チャンネル"
				value={settings.honeypotChannelId}
				channels={metadata.channels}
				onChange={(v) => onChange("honeypotChannelId", v)}
			/>

			<ChannelSelect
				label="レポートチャンネル"
				value={settings.honeypotReportId}
				channels={metadata.channels}
				onChange={(v) => onChange("honeypotReportId", v)}
			/>

			<RoleSelect
				label="除外ロール"
				value={settings.honeypotIgnoreRole}
				roles={metadata.roles}
				onChange={(v) => onChange("honeypotIgnoreRole", v)}
			/>
		</Box>
	);
}
