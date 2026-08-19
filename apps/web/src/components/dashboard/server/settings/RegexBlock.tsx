"use client";

import { Box, FormControlLabel, Switch, TextField } from "@mui/material";
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

export default function RegexBlock({
	settings,
	metadata,
	onToggle,
	onChange,
}: Props) {
	const patterns = (() => {
		try {
			return JSON.parse(settings.regexPatterns ?? "[]") as string[];
		} catch {
			return [];
		}
	})();

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
			<FormControlLabel
				control={
					<Switch
						checked={settings.regexBlockEnabled}
						onChange={() => onToggle("regexBlockEnabled")}
					/>
				}
				label="正規表現ブロックを有効化"
			/>

			<TextField
				label="正規表現"
				multiline
				minRows={6}
				helperText="1行につき1つの正規表現を入力"
				value={patterns.join("\n")}
				onChange={(e) => {
					const value = JSON.stringify(
						e.target.value
							.split(/\r?\n/)
							.map((v) => v.trim())
							.filter(Boolean),
					);
					onChange("regexPatterns", value);
				}}
			/>

			<ChannelSelect
				label="レポートチャンネル"
				value={settings.regexReportChannelId}
				channels={metadata.channels}
				onChange={(v) => onChange("regexReportChannelId", v)}
			/>

			<RoleMultiSelect
				label="除外ロール"
				value={settings.regexIgnoredRoles ?? ""}
				roles={metadata.roles}
				onChange={(v) => onChange("regexIgnoredRoles", v.join(","))}
			/>

			<ChannelMultiSelect
				label="除外チャンネル"
				value={settings.regexIgnoredChannels ?? ""}
				channels={metadata.channels}
				onChange={(v) => onChange("regexIgnoredChannels", v.join(","))}
			/>
		</Box>
	);
}
