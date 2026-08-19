"use client";

import CheckIcon from "@mui/icons-material/Check"; // アイコンを追加
import {
	FormControl,
	InputLabel,
	ListItemText, // テキストを右端に寄せるために追加
	MenuItem,
	Select,
	Typography,
} from "@mui/material";

type Channel = {
	id: string;
	name: string;
};

type Props = {
	label: string;
	value?: string;
	channels: Channel[];
	onChange: (value: string) => void;
	required?: boolean;
	error?: boolean;
	disabled?: boolean;
};

export default function ChannelSelect({
	label,
	value,
	channels,
	onChange,
	required = false,
	error = false,
	disabled = false,
}: Props) {
	// 選択されているチャンネルの名前を特定するヘルパー関数
	const getSelectedChannelName = (selectedId?: string) => {
		if (!selectedId) return "なし";
		const found = channels.find((c) => c.id === selectedId);
		return found ? `#${found.name}` : "";
	};

	return (
		<>
			<Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
				{label}
				{required && (
					<Typography
						component="span"
						color="error"
						variant="caption"
						sx={{ ml: 1 }}
					>
						*必須
					</Typography>
				)}
			</Typography>

			<FormControl fullWidth size="small" error={error}>
				<InputLabel>チャンネルを選択</InputLabel>

				<Select
					value={value}
					label="チャンネルを選択"
					onChange={(e) => onChange(e.target.value)}
					disabled={disabled}
					// 表示用テキストのカスタマイズ（枠内にチェックマークがはみ出るのを防ぐ）
					renderValue={(selected) => getSelectedChannelName(selected)}
				>
					<MenuItem
						value=""
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<ListItemText>
							<em>なし</em>
						</ListItemText>
						{value === "" && <CheckIcon fontSize="small" color="primary" />}
					</MenuItem>

					{channels.map((channel) => {
						const isSelected = value === channel.id;
						return (
							<MenuItem
								key={channel.id}
								value={channel.id}
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<ListItemText>{`#${channel.name}`}</ListItemText>
								{isSelected && <CheckIcon fontSize="small" color="primary" />}
							</MenuItem>
						);
					})}
				</Select>
			</FormControl>
		</>
	);
}
