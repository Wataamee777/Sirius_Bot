"use client";

import { Box, FormControlLabel, Switch } from "@mui/material";
import ChannelMultiSelect from "@/components/dashboard/server/settings/ui/ChannelMultiSelect";
import ChannelSelect from "@/components/dashboard/server/settings/ui/ChannelSelect";
import RoleMultiSelect from "@/components/dashboard/server/settings/ui/RoleMultiSelect";

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

export default function SpamBlock({
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
						checked={settings.spamBlockEnabled}
						onChange={() => onToggle("spamBlockEnabled")}
					/>
				}
				label="スパムブロックを有効化"
			/>

			<ChannelSelect
				label="レポートチャンネル"
				value={settings.spamReportChannelId}
				channels={metadata.channels}
				onChange={(v) => onChange("spamReportChannelId", v)}
			/>

			<RoleMultiSelect
				label="除外ロール"
				value={settings.spamIgnoredRoles ?? ""}
				roles={metadata.roles}
				onChange={(v) => onChange("spamIgnoredRoles", v.join(","))}
			/>

			<ChannelMultiSelect
				label="除外チャンネル"
				value={settings.spamIgnoredChannels ?? ""}
				channels={metadata.channels}
				onChange={(v) => onChange("spamIgnoredChannels", v.join(","))}
			/>
		</Box>
	);
}
