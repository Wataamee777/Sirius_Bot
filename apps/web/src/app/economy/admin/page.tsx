import {
	Box,
	Card,
	CardContent,
	Container,
	Grid,
	LinearProgress,
	List,
	ListItem,
	ListItemText,
	Stack,
	Typography,
} from "@mui/material";
import { prisma } from "@sirius/database";
import { redirect } from "next/navigation";
import AccountSearchPanel from "@/components/economy/AccountSearchPanel";
import { getDiscordAccountForSession } from "@/lib/economy";

const ECONOMY_ADMIN_DISCORD_ID = "1275233053601435703";
const ISSUE_PER_ACCOUNT = 1_000_000;

// string, number, bigint いずれも受け取れるように変更
function formatCurrency(value: number | string | bigint) {
	const num = typeof value === "bigint" ? Number(value) : Number(value || 0);
	return `${num.toLocaleString()}円`;
}

function formatPercent(value: number) {
	return `${value.toFixed(2)}%`;
}

function formatSignedCurrency(value: number | string | bigint) {
	const num = typeof value === "bigint" ? Number(value) : Number(value || 0);
	const sign = num > 0 ? "+" : "";
	return `${sign}${num.toLocaleString()}円`;
}

export default async function EconomyAdminPage() {
	const authData = await getDiscordAccountForSession();

	if (!authData) {
		redirect("/login");
	}

	if (authData.discordId !== ECONOMY_ADMIN_DISCORD_ID) {
		redirect("/economy");
	}

	const rawAccounts: Array<{
		name: string;
		discordId: string;
		coins: bigint | string | number;
	}> = await prisma.economyAccount.findMany({
		select: {
			name: true,
			discordId: true,
			coins: true,
		},
	});

	// DBの coins が String 型のため、JS側で BigInt 変換して正しい数値順に降順ソート
	const accounts = rawAccounts.sort(
		(
			a: { coins: bigint | string | number },
			b: { coins: bigint | string | number },
		) => {
			const coinsA = BigInt(a.coins || "0");
			const coinsB = BigInt(b.coins || "0");
			if (coinsB > coinsA) return 1;
			if (coinsB < coinsA) return -1;
			return 0;
		},
	);

	const totalAccounts = accounts.length;

	// BigInt で安全に合計を計算して Number に変換
	const totalCoinsBigInt = accounts.reduce(
		(sum: bigint, account: { coins: bigint | string | number }) =>
			sum + BigInt(account.coins || "0"),
		BigInt(0),
	);
	const totalCoins = Number(totalCoinsBigInt);

	const totalIssued = totalAccounts * ISSUE_PER_ACCOUNT;
	const circulationRate =
		totalIssued === 0 ? 0 : (totalCoins / totalIssued) * 100;
	const averageBalance = totalAccounts === 0 ? 0 : totalCoins / totalAccounts;

	const topAccounts = accounts.slice(0, 10).map(
		(
			account: {
				name: string;
				discordId: string;
				coins: bigint | string | number;
			},
			index: number,
		) => {
			const coinsNum = Number(account.coins || 0);
			return {
				...account,
				rank: index + 1,
				share: totalCoins === 0 ? 0 : (coinsNum / totalCoins) * 100,
			};
		},
	);

	const recentLogs = await prisma.economyLog.findMany({
		orderBy: { createdAt: "desc" },
		take: 20,
		select: {
			id: true,
			discordId: true,
			eventType: true,
			amount: true,
			balanceBefore: true,
			balanceAfter: true,
			description: true,
			metadata: true,
			createdAt: true,
		},
	});

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Stack spacing={3}>
				<Box>
					<Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
						経済管理者ページ
					</Typography>
					<Typography color="text.secondary">
						通貨発行量は「経済アカウント数 × 100万」を基準に計算しています。
					</Typography>
				</Box>

				<Grid container spacing={3}>
					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
						<Card>
							<CardContent>
								<Typography variant="body2" color="text.secondary">
									経済アカウント数
								</Typography>
								<Typography variant="h5" sx={{ fontWeight: 700 }}>
									{totalAccounts.toLocaleString()}件
								</Typography>
							</CardContent>
						</Card>
					</Grid>

					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
						<Card>
							<CardContent>
								<Typography variant="body2" color="text.secondary">
									総所持金
								</Typography>
								<Typography variant="h5" sx={{ fontWeight: 700 }}>
									{formatCurrency(totalCoins)}
								</Typography>
							</CardContent>
						</Card>
					</Grid>

					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
						<Card>
							<CardContent>
								<Typography variant="body2" color="text.secondary">
									発行総額
								</Typography>
								<Typography variant="h5" sx={{ fontWeight: 700 }}>
									{formatCurrency(totalIssued)}
								</Typography>
							</CardContent>
						</Card>
					</Grid>

					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
						<Card>
							<CardContent>
								<Typography variant="body2" color="text.secondary">
									平均所持金
								</Typography>
								<Typography variant="h5" sx={{ fontWeight: 700 }}>
									{formatCurrency(Math.round(averageBalance))}
								</Typography>
							</CardContent>
						</Card>
					</Grid>
				</Grid>

				<Card>
					<CardContent>
						<Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
							全体保有比率
						</Typography>
						<Stack spacing={2}>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<Typography variant="body2" color="text.secondary">
									総所持金 ÷ 発行総額
								</Typography>
								<Typography variant="h6" sx={{ fontWeight: 700 }}>
									{formatPercent(circulationRate)}
								</Typography>
							</Box>

							<LinearProgress
								variant="determinate"
								value={Math.min(circulationRate, 100)}
								sx={{
									height: 10,
									borderRadius: 999,
									backgroundColor: "#e0e0e0",
									"& .MuiLinearProgress-bar": {
										backgroundColor:
											circulationRate > 80
												? "#f44336"
												: circulationRate > 50
													? "#ff9800"
													: "#4caf50",
									},
								}}
							/>

							<Typography variant="body2" color="text.secondary">
								1アカウントあたりの発行額: {formatCurrency(ISSUE_PER_ACCOUNT)}
							</Typography>
						</Stack>
					</CardContent>
				</Card>

				<Grid container spacing={3}>
					<Grid size={{ xs: 12, md: 6 }}>
						<Card>
							<CardContent>
								<Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
									上位保有者
								</Typography>

								<List dense>
									{topAccounts.map((account) => (
										<ListItem key={account.discordId} divider>
											<ListItemText
												primary={`${account.rank}. ${account.name}`}
												secondary={
													<>
														{formatCurrency(account.coins)} · 取引比率{" "}
														{formatPercent(account.share)}
													</>
												}
											/>
										</ListItem>
									))}
								</List>
							</CardContent>
						</Card>
					</Grid>

					<Grid size={{ xs: 12, md: 6 }}>
						<Card>
							<CardContent>
								<Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
									計算ルール
								</Typography>
								<Stack spacing={1.5}>
									<Typography variant="body2" color="text.secondary">
										1. 経済アカウント数 × 1,000,000 を発行総額とみなす
									</Typography>
									<Typography variant="body2" color="text.secondary">
										2. 全アカウントの coins 合計を総所持金として計算する
									</Typography>
									<Typography variant="body2" color="text.secondary">
										3. 総所持金 ÷ 発行総額 × 100 で流通率を算出する
									</Typography>
									<Typography variant="body2" color="text.secondary">
										4. 各アカウントの保有比率は個別所持金 ÷ 総所持金 × 100
									</Typography>
								</Stack>
							</CardContent>
						</Card>
					</Grid>
				</Grid>

				<Card>
					<CardContent>
						<Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
							最近の経済ログ
						</Typography>

						<List dense>
							{recentLogs.length === 0 ? (
								<ListItem>
									<ListItemText primary="表示できるログがありません" />
								</ListItem>
							) : (
								recentLogs.map((log) => (
									<ListItem key={log.id} divider>
										<ListItemText
											primary={
												<Box
													sx={{
														display: "flex",
														gap: 1,
														flexWrap: "wrap",
														alignItems: "center",
													}}
												>
													<Typography variant="body2" sx={{ fontWeight: 700 }}>
														{log.discordId}
													</Typography>
													<Typography variant="caption" color="text.secondary">
														{log.eventType}
													</Typography>
													<Typography
														variant="body2"
														sx={{
															fontWeight: 700,
															color:
																Number(log.amount || 0) >= 0
																	? "success.main"
																	: "error.main",
														}}
													>
														{formatSignedCurrency(log.amount)}
													</Typography>
												</Box>
											}
											secondary={
												<>
													{log.description || "説明なし"}
													<br />
													{new Date(log.createdAt).toLocaleString("ja-JP")} ·
													前後残高: {formatCurrency(log.balanceBefore)} →{" "}
													{formatCurrency(log.balanceAfter)}
													{log.metadata ? ` · ${log.metadata}` : ""}
												</>
											}
										/>
									</ListItem>
								))
							)}
						</List>
					</CardContent>
				</Card>

				{/* 個人データ管理パネル */}
				<AccountSearchPanel />
			</Stack>
		</Container>
	);
}
