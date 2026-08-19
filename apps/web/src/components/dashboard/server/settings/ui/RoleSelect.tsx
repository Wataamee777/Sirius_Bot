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

type Role = {
	id: string;
	name: string;
};

type Props = {
	label: string;
	value?: string;
	roles: Role[];
	onChange: (value: string) => void;
	disabled?: boolean;
};

export default function RoleSelect({
	label,
	value,
	roles,
	onChange,
	disabled = false,
}: Props) {
	// 選択されているロール名を特定するヘルパー
	const getSelectedRoleName = (selectedId?: string) => {
		if (!selectedId) return "なし";
		const found = roles.find((r) => r.id === selectedId);
		return found ? found.name : "";
	};

	return (
		<>
			<Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
				{label}
			</Typography>

			<FormControl fullWidth size="small" disabled={disabled}>
				<InputLabel>ロールを選択</InputLabel>

				<Select
					value={value}
					label="ロールを選択"
					onChange={(e) => onChange(e.target.value)}
					// 選択枠内にチェックマークがはみ出るのを防ぐ
					renderValue={(selected) => getSelectedRoleName(selected)}
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

					{roles.map((role) => {
						const isSelected = value === role.id;
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
