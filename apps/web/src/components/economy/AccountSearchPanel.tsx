"use client";

import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	CircularProgress,
	FormControl,
	Grid,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useActionState, useState } from "react";
import {
	getEconomyAccountDetail,
	searchEconomyAccounts,
	updateEconomyAccountAsAdmin,
} from "@/lib/economy-actions";
import { FIXED_AFFILIATION_NAMES } from "@/lib/economy-constants";

interface SearchResult {
	id: string;
	name: string;
	discordId: string;
	coins: string;
	affiliationName: string;
}

interface AccountDetail {
	id: string;
	name: string;
	discordId: string;
	coins: string | bigint | number;
	satiation: number;
	happiness: number;
	intelligenceLevel: number;
	affiliationName: string;
	affiliationId: string | null;
	status: string;
	createdAt: Date;
	updatedAt: Date;
}

export default function AccountSearchPanel() {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [selectedAccount, setSelectedAccount] = useState<AccountDetail | null>(
		null,
	);
	const [isSearching, setIsSearching] = useState(false);
	const [isLoadingDetail, setIsLoadingDetail] = useState(false);

	// selectedAccount!.id によるクラッシュを防ぐため、安全にクロージャで処理
	const [updateState, updateAction, isUpdating] = useActionState(
		async (
			prevState: Awaited<ReturnType<typeof updateEconomyAccountAsAdmin>> | null,
			formData: FormData,
		) => {
			if (!selectedAccount) return { error: "アカウントが選択されていません" };
			return await updateEconomyAccountAsAdmin(
				selectedAccount.id,
				prevState,
				formData,
			);
		},
		null,
	);

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!searchQuery.trim() || isSearching) return;

		setIsSearching(true);
		try {
			const result = await searchEconomyAccounts(searchQuery);
			if ("error" in result && result.error) {
				setSearchResults([]);
			} else {
				setSearchResults((result.accounts as SearchResult[]) || []);
			}
		} finally {
			setIsSearching(false);
		}
	};

	const handleSelectAccount = async (account: SearchResult) => {
		setIsLoadingDetail(true);
		try {
			const result = await getEconomyAccountDetail(account.id);
			if ("error" in result && result.error) {
				console.error(result.error);
			} else if (result.account) {
				const nextAccount: AccountDetail = {
					id: result.account.id,
					name: result.account.name,
					discordId: result.account.discordId,
					coins: BigInt(result.account.coins ?? 0),
					satiation: result.account.satiation,
					happiness: result.account.happiness,
					intelligenceLevel: result.account.intelligenceLevel,
					affiliationName: result.account.affiliationName ?? "未所属",
					affiliationId: result.account.affiliationId ?? null,
					status: result.account.status,
					createdAt: result.account.createdAt,
					updatedAt: result.account.updatedAt,
				};
				setSelectedAccount(nextAccount);
			}
		} finally {
			setIsLoadingDetail(false);
		}
	};

	return (
		<Stack spacing={3}>
			{/* 検索パネル */}
			<Card>
				<CardContent>
					<Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
						個人データ管理
					</Typography>

					<Box component="form" onSubmit={handleSearch} noValidate>
						<Stack spacing={2}>
							<TextField
								fullWidth
								placeholder="ユーザー名またはDiscord IDで検索"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								size="small"
							/>
							<Button
								type="submit"
								variant="contained"
								fullWidth
								disabled={!searchQuery.trim() || isSearching}
								startIcon={
									isSearching ? (
										<CircularProgress size={20} color="inherit" />
									) : null
								}
							>
								{isSearching ? "検索中..." : "検索"}
							</Button>
						</Stack>
					</Box>

					{/* 検索結果 */}
					{searchResults.length > 0 && (
						<Box sx={{ mt: 2 }}>
							<Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
								検索結果
							</Typography>
							<Stack spacing={1}>
								{searchResults.map((result) => (
									<Button
										key={result.id}
										variant="outlined"
										fullWidth
										onClick={() => handleSelectAccount(result)}
										sx={{
											justifyContent: "flex-start",
											textAlign: "left",
											color: "text.primary",
											borderColor: "divider",
										}}
									>
										<Box sx={{ width: "100%" }}>
											<Typography variant="body2" sx={{ fontWeight: 600 }}>
												{result.name}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												{result.discordId} • {result.affiliationName} •{" "}
												{Number(result.coins || 0).toLocaleString()}円
											</Typography>
										</Box>
									</Button>
								))}
							</Stack>
						</Box>
					)}
				</CardContent>
			</Card>

			{/* 詳細表示・編集パネル */}
			{isLoadingDetail && (
				<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
					<CircularProgress />
				</Box>
			)}

			{selectedAccount && !isLoadingDetail && (
				<Card>
					<CardContent>
						<Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
							{selectedAccount.name} のデータ編集
						</Typography>

						{updateState?.error && (
							<Alert severity="error" sx={{ mb: 2 }}>
								{updateState.error}
							</Alert>
						)}

						{updateState?.success && (
							<Alert severity="success" sx={{ mb: 2 }}>
								アカウント情報を更新しました
							</Alert>
						)}

						{/* key属性に selectedAccount.id を付与してフォームの再初期化を保証 */}
						<Box
							component="form"
							key={selectedAccount.id}
							action={updateAction}
						>
							<Grid container spacing={2}>
								{/* 基本情報 */}
								<Grid size={{ xs: 12, sm: 6, md: 4 }}>
									<TextField
										fullWidth
										label="ユーザー名"
										value={selectedAccount.name}
										disabled
										size="small"
									/>
								</Grid>

								<Grid size={{ xs: 12, sm: 6, md: 4 }}>
									<TextField
										fullWidth
										label="Discord ID"
										value={selectedAccount.discordId}
										disabled
										size="small"
									/>
								</Grid>

								<Grid size={{ xs: 12, sm: 6, md: 4 }}>
									<TextField
										fullWidth
										label="ステータス"
										name="status"
										defaultValue={selectedAccount.status}
										size="small"
										disabled
									/>
								</Grid>

								{/* 経済関連 */}
								<Grid size={{ xs: 12, sm: 6 }}>
									<TextField
										fullWidth
										label="コイン"
										name="coins"
										type="number"
										defaultValue={selectedAccount.coins}
										slotProps={{ htmlInput: { min: 0 } }}
										size="small"
									/>
								</Grid>

								<Grid size={{ xs: 12, sm: 6 }}>
									<FormControl fullWidth size="small">
										<InputLabel>所属グループ</InputLabel>
										<Select
											name="affiliationName"
											label="所属グループ"
											defaultValue={selectedAccount.affiliationName}
										>
											{FIXED_AFFILIATION_NAMES.map((name) => (
												<MenuItem key={name} value={name}>
													{name}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid>

								{/* ステータス関連 */}
								<Grid size={{ xs: 12, sm: 6 }}>
									<TextField
										fullWidth
										label="空腹度 (%)"
										name="satiation"
										type="number"
										defaultValue={selectedAccount.satiation}
										slotProps={{ htmlInput: { min: 0, max: 100 } }}
										size="small"
									/>
								</Grid>

								<Grid size={{ xs: 12, sm: 6 }}>
									<TextField
										fullWidth
										label="幸福度 (%)"
										name="happiness"
										type="number"
										defaultValue={selectedAccount.happiness}
										slotProps={{ htmlInput: { min: 0, max: 100 } }}
										size="small"
									/>
								</Grid>

								<Grid size={{ xs: 12, sm: 6 }}>
									<TextField
										fullWidth
										label="知能レベル"
										name="intelligenceLevel"
										type="number"
										defaultValue={selectedAccount.intelligenceLevel}
										slotProps={{ htmlInput: { min: 0 } }}
										size="small"
									/>
								</Grid>

								{/* メタデータ */}
								<Grid size={{ xs: 12, sm: 6 }}>
									<TextField
										fullWidth
										label="作成日時"
										value={new Date(selectedAccount.createdAt).toLocaleString(
											"ja-JP",
										)}
										disabled
										size="small"
									/>
								</Grid>

								<Grid size={{ xs: 12, sm: 6 }}>
									<TextField
										fullWidth
										label="更新日時"
										value={new Date(selectedAccount.updatedAt).toLocaleString(
											"ja-JP",
										)}
										disabled
										size="small"
									/>
								</Grid>

								{/* ボタン */}
								<Grid size={{ xs: 12 }}>
									<Stack
										direction="row"
										spacing={2}
										sx={{ justifyContent: "flex-end" }}
									>
										<Button
											variant="outlined"
											onClick={() => setSelectedAccount(null)}
											disabled={isUpdating}
										>
											キャンセル
										</Button>
										<Button
											type="submit"
											variant="contained"
											disabled={isUpdating}
											startIcon={
												isUpdating ? (
													<CircularProgress size={20} color="inherit" />
												) : null
											}
										>
											{isUpdating ? "更新中..." : "更新"}
										</Button>
									</Stack>
								</Grid>
							</Grid>
						</Box>
					</CardContent>
				</Card>
			)}
		</Stack>
	);
}
