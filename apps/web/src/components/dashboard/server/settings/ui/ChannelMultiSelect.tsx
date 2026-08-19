"use client";

import CheckIcon from "@mui/icons-material/Check"; // アイコンを追加
import {
	Box,
	Chip,
	FormControl,
	InputLabel,
	ListItemText, // テキストを右端に寄せるために追加
	MenuItem,
	OutlinedInput,
	Select,
	Typography,
} from "@mui/material";

type Channel = {
	id: string;
	name: string;
};

type Props = {
	label: string;
	value: unknown;
	channels: Channel[];
	onChange: (value: string[]) => void;
};

export default function ChannelMultiSelect({
	label,
	value,
	channels,
	onChange,
}: Props) {
	const selectedValues = Array.isArray(value)
		? value
		: value
			? [String(value)]
			: [];

	return (
		<>
			<Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
				{label}
			</Typography>

			<FormControl fullWidth size="small">
				<InputLabel>チャンネルを選択</InputLabel>

				<Select
					multiple
					value={selectedValues}
					onChange={(e) => onChange(e.target.value as string[])}
					input={<OutlinedInput label="チャンネルを選択" />}
					renderValue={() => (
						<Box
							sx={{
								display: "flex",
								flexWrap: "wrap",
								gap: 0.5,
							}}
						>
							{selectedValues.map((id) => (
								<Chip
									key={id}
									size="small"
									label={channels.find((c) => c.id === id)?.name ?? id}
								/>
							))}
						</Box>
					)}
				>
					{channels.map((channel) => {
						// 現在のチャンネルが選択されているかどうかを判定
						const isSelected = selectedValues.includes(channel.id);

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
