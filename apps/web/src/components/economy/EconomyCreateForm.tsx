"use client";

import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Checkbox,
	Chip,
	Container,
	FormControl,
	FormControlLabel,
	FormGroup,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import NextLink from "next/link";
import { useActionState, useState } from "react";
import { createEconomyAccount } from "@/lib/economy-actions";
import { FIXED_AFFILIATION_NAMES } from "@/lib/economy-constants";

const today = new Date();
// 13歳未満制限用の上限日
const maxBirthdate = new Date(
	Date.UTC(today.getFullYear() - 13, today.getMonth(), today.getDate()),
)
	.toISOString()
	.slice(0, 10);

// 16歳未満判定用しきい値
const threshold16YearsAgo = new Date(
	Date.UTC(today.getFullYear() - 16, today.getMonth(), today.getDate()),
);

export default function EconomyCreateForm() {
	const [state, formAction, isPending] = useActionState(
		createEconomyAccount,
		null,
	);
	const [birthdate, setBirthdate] = useState<string>("");

	// 選択された日付から16歳未満かどうか判定
	const isUnder16 = Boolean(
		birthdate && new Date(birthdate) > threshold16YearsAgo,
	);

	return (
		<Container maxWidth="md" sx={{ py: { xs: 4, md: 7 } }}>
			<Paper
				elevation={0}
				sx={{
					overflow: "hidden",
					border: "1px solid",
					borderColor: "divider",
					borderRadius: 4,
					bgcolor: "background.paper",
				}}
			>
				<Box
					sx={{
						p: { xs: 3, md: 5 },
						color: "common.white",
						background:
							"linear-gradient(135deg, #4f46e5 0%, #7c3aed 45%, #ec4899 100%)",
					}}
				>
					<Chip
						label="13歳以上限定"
						sx={{ mb: 2, bgcolor: "rgba(255,255,255,0.2)", color: "inherit" }}
					/>
					<Typography variant="h3" component="h1" sx={{ fontWeight: 900 }}>
						経済アカウント作成
					</Typography>
					<Typography sx={{ mt: 1.5, maxWidth: 620, opacity: 0.92 }}>
						生年月日だけを入力して、SiriusBot の経済システムを始めましょう。
						バースデーコインは誕生日当日に 50,000 コイン配付されます。
					</Typography>
				</Box>

				<Box component="form" action={formAction} sx={{ p: { xs: 3, md: 5 } }}>
					<Stack spacing={3}>
						{state?.error && (
							<Alert severity="error">
								<Typography variant="body2" sx={{ fontWeight: 600 }}>
									アカウント作成に失敗しました
								</Typography>
								<Typography variant="body2" sx={{ mt: 0.5 }}>
									{state.error}
								</Typography>
							</Alert>
						)}

						<Alert severity="info">
							16歳未満の利用の際は親権者の同意が必要です。また生年月日から13歳未満と判定された場合、
							アカウント作成はできません。また、VPNの使用や同一IPアドレスでの複数登録は禁止です。
						</Alert>

						<Card variant="outlined" sx={{ borderRadius: 3 }}>
							<CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
								<Stack spacing={3}>
									<TextField
										fullWidth
										required
										label="生年月日"
										name="birthdate"
										type="date"
										value={birthdate}
										onChange={(e) => setBirthdate(e.target.value)}
										helperText="13歳以上確認と、誕生日ボーナス配付日の判定に使用します。"
										variant="outlined"
										slotProps={{
											htmlInput: { max: maxBirthdate },
											inputLabel: { shrink: true },
										}}
									/>

									<FormControl fullWidth required>
										<InputLabel id="affiliation-label">所属</InputLabel>
										<Select
											labelId="affiliation-label"
											name="affiliationName"
											label="所属"
											defaultValue=""
											required
										>
											{FIXED_AFFILIATION_NAMES.map((name) => (
												<MenuItem key={name} value={name}>
													{name}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Stack>
							</CardContent>
						</Card>

						<Paper
							variant="outlined"
							sx={{ p: 2.5, borderRadius: 3, bgcolor: "grey.50" }}
						>
							<Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
								初期設定
							</Typography>
							<Stack
								direction="row"
								spacing={1}
								useFlexGap
								sx={{ flexWrap: "wrap" }}
							>
								<Chip label="バースデーコイン: 50,000" />
								<Chip label="空腹度: 100%" />
								<Chip label="幸福度: 100%" />
								<Chip label="知能レベル: Lv.0" />
							</Stack>
						</Paper>

						<FormGroup>
							<FormControlLabel
								control={<Checkbox name="acceptedTerms" required />}
								label="利用規約に同意します（必須）"
							/>
							<FormControlLabel
								control={<Checkbox name="acceptedPrivacy" required />}
								label="プライバシーポリシーに同意します（必須）"
							/>

							{/* 16歳未満の場合のみ条件付きで表示 */}
							{isUnder16 && (
								<FormControlLabel
									control={<Checkbox name="acceptedParentalConsent" required />}
									label="16歳未満のため、親権者（保護者）の同意を得て登録します（必須）"
									sx={{
										mt: 1,
										p: 1,
										bgcolor: "warning.50",
										borderRadius: 2,
										border: "1px solid",
										borderColor: "warning.200",
									}}
								/>
							)}
						</FormGroup>

						<Stack
							direction={{ xs: "column", sm: "row" }}
							spacing={2}
							sx={{ justifyContent: "flex-end" }}
						>
							<Button
								component={NextLink}
								href="/economy"
								variant="outlined"
								size="large"
								disabled={isPending}
							>
								戻る
							</Button>
							<Button
								type="submit"
								variant="contained"
								size="large"
								disabled={isPending}
							>
								{isPending ? "作成中..." : "アカウントを作成"}
							</Button>
						</Stack>
					</Stack>
				</Box>
			</Paper>
		</Container>
	);
}
