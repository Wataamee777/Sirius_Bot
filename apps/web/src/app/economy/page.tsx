import {
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	type ChipProps,
	Container,
	Grid,
	LinearProgress,
	Stack,
	Typography,
} from "@mui/material";
import { redirect } from "next/navigation";
import ExerciseGame from "@/components/economy/ExerciseGame";
import NextLink from "@/components/NextLink";
import {
	getDiscordAccountForSession,
	getEconomyAccountByDiscordId,
} from "@/lib/economy";

export default async function EconomyDashboardPage() {
	const authData = await getDiscordAccountForSession();
	if (!authData) {
		redirect("/login");
	}

	const account = await getEconomyAccountByDiscordId(authData.discordId);

	if (!account) {
		return (
			<Container maxWidth="md" sx={{ py: 4 }}>
				<Typography variant="h4" sx={{ mb: 1, fontWeight: 800 }}>
					経済システム
				</Typography>
				<Typography color="text.secondary" sx={{ mb: 4 }}>
					まずアカウント作成項目（所属など）を設定し、その後 Discord
					連携アカウントを作成してください。
				</Typography>

				<Grid container spacing={3}>
					<Grid size={{ xs: 12, md: 12 }}>
						<Card>
							<CardContent>
								<Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
									1. 経済アカウントを作成
								</Typography>
								<Typography color="text.secondary" sx={{ mb: 2 }}>
									所属を選んでアカウントを作成します（知能 Lv.0 から開始）。
								</Typography>
								<Button
									component={NextLink}
									href="/economy/create"
									variant="contained"
								>
									アカウント作成
								</Button>
							</CardContent>
						</Card>
					</Grid>
				</Grid>
			</Container>
		);
	}

	// ステータスの色を決定
	const getStatusColor = (status: string): ChipProps["color"] => {
		switch (status) {
			case "健康":
				return "success";
			case "精神病":
				return "error";
			case "糖尿病":
				return "warning";
			case "餓死":
				return "error";
			default:
				return "default";
		}
	};

	// 学校進捗を計算
	const schoolProgress = Math.round((account.schoolAttendanceCount / 60) * 100);

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Typography variant="h4" sx={{ mb: 1, fontWeight: 800 }}>
				経済システム
			</Typography>
			<Typography color="text.secondary" sx={{ mb: 4 }}>
				Discord 上で `/work` `/pay food` `/school` `/roto6` `/account status`
				が利用できます。
			</Typography>

			<Grid container spacing={3}>
				{/* ステータスカード */}
				<Grid size={{ xs: 12, md: 6 }}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
								📊 あなたのステータス
							</Typography>
							<Stack spacing={2}>
								<Box>
									<Typography variant="body2" color="text.secondary">
										表示名
									</Typography>
									<Typography variant="body1">{account.name}</Typography>
								</Box>

								<Box>
									<Typography variant="body2" color="text.secondary">
										コイン
									</Typography>
									<Typography variant="h6">
										{account.coins.toLocaleString()} 円
									</Typography>
								</Box>

								<Box>
									<Typography variant="body2" color="text.secondary">
										知能レベル
									</Typography>
									<Typography variant="body1">
										Lv.{account.intelligenceLevel}
									</Typography>
								</Box>

								<Box>
									<Typography variant="body2" color="text.secondary">
										所属
									</Typography>
									<Typography variant="body1">未所属</Typography>
								</Box>

								<Box>
									<Typography variant="body2" color="text.secondary">
										ステータス
									</Typography>
									<Chip
										label={account.status}
										color={getStatusColor(account.status)}
										size="small"
									/>
								</Box>
							</Stack>
						</CardContent>
					</Card>
				</Grid>

				{/* 満腹度・幸福度カード */}
				<Grid size={{ xs: 12, md: 6 }}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
								💚 健康状態
							</Typography>
							<Stack spacing={2}>
								<Box>
									<Box
										sx={{
											display: "flex",
											justifyContent: "space-between",
											mb: 1,
										}}
									>
										<Typography variant="body2">満腹度</Typography>
										<Typography variant="body2">
											{account.satiation}/100
										</Typography>
									</Box>
									<LinearProgress
										variant="determinate"
										value={account.satiation}
										sx={{
											height: 8,
											borderRadius: 4,
											backgroundColor: "#e0e0e0",
											"& .MuiLinearProgress-bar": {
												backgroundColor:
													account.satiation > 50
														? "#4caf50"
														: account.satiation > 20
															? "#ff9800"
															: "#f44336",
											},
										}}
									/>
								</Box>

								<Box>
									<Box
										sx={{
											display: "flex",
											justifyContent: "space-between",
											mb: 1,
										}}
									>
										<Typography variant="body2">幸福度</Typography>
										<Typography variant="body2">
											{account.happiness}/100
										</Typography>
									</Box>
									<LinearProgress
										variant="determinate"
										value={account.happiness}
										sx={{
											height: 8,
											borderRadius: 4,
											backgroundColor: "#e0e0e0",
											"& .MuiLinearProgress-bar": {
												backgroundColor:
													account.happiness > 50
														? "#2196f3"
														: account.happiness > 20
															? "#ff9800"
															: "#f44336",
											},
										}}
									/>
								</Box>

								{account.intelligenceLevel === 0 && (
									<Box>
										<Box
											sx={{
												display: "flex",
												justifyContent: "space-between",
												mb: 1,
											}}
										>
											<Typography variant="body2">学校進捗</Typography>
											<Typography variant="body2">
												{account.schoolAttendanceCount}/60
											</Typography>
										</Box>
										<LinearProgress
											variant="determinate"
											value={schoolProgress}
											sx={{
												height: 8,
												borderRadius: 4,
												backgroundColor: "#e0e0e0",
												"& .MuiLinearProgress-bar": {
													backgroundColor: "#9c27b0",
												},
											}}
										/>
									</Box>
								)}
							</Stack>
						</CardContent>
					</Card>
				</Grid>

				{/* 運動ゲーム */}
				<Grid size={{ xs: 12 }}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
								💪 運動ゲーム
							</Typography>
							<Typography color="text.secondary" sx={{ mb: 2 }}>
								ターゲットをタップして運動しましょう。満腹度が50%になると終了します。
								10タップごとに満腹度-1%、幸福度+3%。
							</Typography>
							<ExerciseGame
								initialSatiation={account.satiation}
								initialHappiness={account.happiness}
							/>
						</CardContent>
					</Card>
				</Grid>
			</Grid>

			<Box sx={{ mt: 4 }}>
				<Typography variant="body2" color="text.secondary">
					定期処理 API: POST /api/economy/cron（Authorization: Bearer
					ECONOMY_CRON_SECRET）
				</Typography>
			</Box>
		</Container>
	);
}
