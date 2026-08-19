"use client";

import CloseIcon from "@mui/icons-material/Close";
import {
	Box,
	Button,
	Card,
	CardActionArea,
	CardContent,
	Dialog,
	DialogContent,
	DialogTitle,
	FormControl,
	FormControlLabel,
	IconButton,
	Stack,
	Switch,
	TextField,
	Typography,
} from "@mui/material";
import { useState } from "react";

type SettingField = {
	id: string;
	label: string;
	type: "input" | "toggle";
	current: string | boolean;
};

type SettingCategory = {
	key: string;
	title: string;
	description: string;
	fields: SettingField[];
};

export default function GuildSettingsPanel({
	categories,
	action,
}: {
	categories: SettingCategory[];
	action: (formData: FormData) => void | Promise<void>;
}) {
	const [activeCategory, setActiveCategory] = useState<SettingCategory | null>(
		null,
	);

	return (
		<>
			<Stack spacing={2}>
				{categories.map((category) => (
					<Card
						key={category.key}
						sx={{ backgroundColor: "#13131a", border: "1px solid #2e2e3a" }}
					>
						<CardActionArea
							onClick={() => setActiveCategory(category)}
							sx={{ p: 2, textAlign: "left" }}
							aria-haspopup="dialog"
							aria-controls="guild-settings-dialog"
						>
							<CardContent sx={{ p: 0 }}>
								<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
									{category.title}
								</Typography>
								<Typography color="text.secondary" sx={{ fontSize: "0.95rem" }}>
									{category.description}
								</Typography>
							</CardContent>
						</CardActionArea>
					</Card>
				))}
			</Stack>

			<Dialog
				id="guild-settings-dialog"
				open={!!activeCategory}
				onClose={() => setActiveCategory(null)}
				aria-labelledby="guild-settings-dialog-title"
				aria-describedby="guild-settings-dialog-description"
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle
					id="guild-settings-dialog-title"
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<span>{activeCategory?.title ?? "設定"}</span>
					<IconButton
						aria-label="閉じる"
						onClick={() => setActiveCategory(null)}
						size="small"
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>

				<DialogContent>
					<Typography
						id="guild-settings-dialog-description"
						color="text.secondary"
						sx={{ mb: 3 }}
					>
						{activeCategory?.description}
					</Typography>

					{activeCategory && (
						<form action={action} style={{ display: "grid", gap: 20 }}>
							<input type="hidden" name="category" value={activeCategory.key} />

							{activeCategory.fields.map((field) =>
								field.type === "toggle" ? (
									<FormControl key={field.id} component="fieldset">
										<FormControlLabel
											control={
												<Switch
													name={field.id}
													defaultChecked={Boolean(field.current)}
													color="primary"
												/>
											}
											label={field.label}
										/>
									</FormControl>
								) : (
									<TextField
										key={field.id}
										id={field.id}
										name={field.id}
										label={field.label}
										defaultValue={String(field.current ?? "")}
										fullWidth
										size="small"
										variant="outlined"
										sx={{ backgroundColor: "#1b1b24" }}
									/>
								),
							)}

							<Box
								sx={{
									display: "flex",
									justifyContent: "flex-end",
									gap: 1,
									mt: 1,
								}}
							>
								<Button
									variant="outlined"
									onClick={() => setActiveCategory(null)}
								>
									キャンセル
								</Button>
								<Button type="submit" variant="contained">
									保存する
								</Button>
							</Box>
						</form>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
