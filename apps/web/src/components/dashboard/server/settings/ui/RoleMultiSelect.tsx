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

type Role = {
	id: string;
	name: string;
};

type Props = {
	label: string;
	value: unknown;
	roles: Role[];
	onChange: (value: string[]) => void;
};

export default function RoleMultiSelect({
	label,
	value,
	roles,
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
				<InputLabel>ロールを選択</InputLabel>

				<Select
					multiple
					value={selectedValues}
					onChange={(e) => onChange(e.target.value as string[])}
					input={<OutlinedInput label="ロールを選択" />}
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
									label={roles.find((r) => r.id === id)?.name ?? id}
								/>
							))}
						</Box>
					)}
				>
					{roles.map((role) => {
						// 現在のロールが選択されているかどうかを配列から判定
						const isSelected = selectedValues.includes(role.id);

						return (
							<MenuItem
								key={role.id}
								value={role.id}
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<ListItemText>{role.name}</ListItemText>
								{isSelected && <CheckIcon fontSize="small" color="primary" />}
							</MenuItem>
						);
					})}
				</Select>
			</FormControl>
		</>
	);
}
