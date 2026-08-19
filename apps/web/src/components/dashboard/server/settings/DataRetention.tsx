"use client";

import {
	Alert,
	Box,
	FormControlLabel,
	Switch,
	Typography,
} from "@mui/material";
import type { GuildSettings } from "./types";

type Props = {
	settings: Partial<GuildSettings>;
	onToggle: (key: keyof GuildSettings) => void;
};

export default function DataRetention({ settings, onToggle }: Props) {
	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
			<FormControlLabel
				control={
					<Switch
						checked={settings.dataRetentionEnabled ?? false}
						onChange={() => onToggle("dataRetentionEnabled")}
					/>
				}
				label={
					<Box>
						<Typography variant="body1" sx={{ fontWeight: 600 }}>
							サーバーデータの保存を有効化
						</Typography>
						<Typography variant="body2" color="text.secondary">
							メッセージログや操作履歴などのサーバーデータをBotが保存します
						</Typography>
					</Box>
				}
			/>

			<Alert severity="info">
				サーバーデータの保存を有効にすると、メッセージログ・モデレーション履歴などのデータがBotによって記録されます。プライバシーポリシーに基づいて管理されます。
			</Alert>

			{settings.dataRetentionEnabled && (
				<Alert severity="warning">
					データの保存が有効になっています。保存されたデータはサーバー管理者が確認・削除できます。
				</Alert>
			)}
		</Box>
	);
}
