"use client";

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddCardIcon from "@mui/icons-material/AddCard";
import CasinoIcon from "@mui/icons-material/Casino";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	CircularProgress,
	Paper,
	Stack,
	Typography,
} from "@mui/material";
import { useState } from "react";

import { processJugglerGame } from "@/lib/juggler";
import { addTestCoins } from "@/lib/testcoins";

interface JugglerProps {
	initialBalance: number;
	discordId: string;
}

const BET_COINS = 30; // 1G = 3枚掛け (30コイン)
const BONUS_ODDS = 135; // 約 1/135 でペカる

// 回転中に流れるアイコンリスト
const SPIN_SYMBOLS = ["🍒", "7", "🍇", "BAR", "🔔", "7"];

export default function Juggler({ initialBalance, discordId }: JugglerProps) {
	const [balance, setBalance] = useState<number>(initialBalance);
	const [isAddingCoins, setIsAddingCoins] = useState<boolean>(false);

	const [games, setGames] = useState<number>(0);
	const [bbCount, setBbCount] = useState<number>(0);
	const [rbCount, setRbCount] = useState<number>(0);

	const [isGogoLit, setIsGogoLit] = useState<boolean>(false);
	const [isSpinning, setIsSpinning] = useState<boolean>(false);
	const [reels, setReels] = useState<string[]>(["7", "7", "7"]);
	const [lastBonus, setLastBonus] = useState<"BB" | "RB" | null>(null);
	const [payoutAmount, setPayoutAmount] = useState<number>(0);

	// 🧪 テスト: 1000コイン加算
	const handleAddCoins = async () => {
		if (isAddingCoins || isSpinning) return;

		setIsAddingCoins(true);
		try {
			const result = await addTestCoins(discordId, 1000);
			if (result.success && result.coins !== undefined) {
				setBalance(Number(result.coins));
			} else {
				alert(result.error || "コインの加算に失敗しました。");
			}
		} catch {
			alert("通信エラーが発生しました。");
		} finally {
			setIsAddingCoins(false);
		}
	};

	// 🎰 1レバーON (1回転)
	const spinReel = async () => {
		if (isSpinning) return;

		if (balance < BET_COINS) {
			return alert(`メダルが足りません！（1回転: ${BET_COINS} コイン）`);
		}

		setIsSpinning(true);
		setIsGogoLit(false);
		setLastBonus(null);

		// 即座にBET分を減算（UIの応答性を高める）
		setBalance((prev) => prev - BET_COINS);
		setGames((prev) => prev + 1);

		// ボーナス判定
		const isHit = Math.floor(Math.random() * BONUS_ODDS) === 0;
		let bonusType: "BB" | "RB" | null = null;

		if (isHit) {
			bonusType = Math.random() < 0.5 ? "BB" : "RB";
		}

		try {
			// サーバー会計処理
			const res = await processJugglerGame(discordId, BET_COINS, bonusType);

			// 800msのアニメーション演出後に結果反映
			setTimeout(() => {
				if (res.success && res.newBalance !== undefined) {
					setBalance(res.newBalance);

					if (bonusType) {
						setIsGogoLit(true);
						setLastBonus(bonusType);
						setPayoutAmount(res.payout);

						if (bonusType === "BB") {
							setBbCount((prev) => prev + 1);
							setReels(["7", "7", "7"]);
						} else {
							setRbCount((prev) => prev + 1);
							setReels(["7", "7", "BAR"]);
						}
						setGames(0); // ボーナス当選でゲーム数リセット
					} else {
						// ハズレ時のリールランダム表示
						const symbols = ["🍒", "🍇", "🔔", "7", "BAR"];
						const r1 = symbols[Math.floor(Math.random() * symbols.length)];
						const r2 = symbols[Math.floor(Math.random() * symbols.length)];
						const r3 = symbols[Math.floor(Math.random() * symbols.length)];
						setReels([r1, r2, r3]);
					}
				} else {
					// エラー時は差し引いたコインを戻す
					setBalance((prev) => prev + BET_COINS);
					setGames((prev) => Math.max(0, prev - 1));
					alert(res.error || "通信エラーが発生しました。");
				}
				setIsSpinning(false);
			}, 800);
		} catch {
			setBalance((prev) => prev + BET_COINS);
			setGames((prev) => Math.max(0, prev - 1));
			alert("通信に失敗しました。");
			setIsSpinning(false);
		}
	};

	return (
		<Box sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
			{/* CSS Keyframes アニメーション定義 */}
			<style>
				{`
          @keyframes reelSpin {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
        `}
			</style>

			<Card
				raised
				sx={{
					borderRadius: 4,
					bgcolor: "#111116",
					color: "#fff",
					border: "3px solid #ff1744",
					boxShadow: "0 0 25px rgba(255, 23, 68, 0.3)",
				}}
			>
				<CardContent>
					<Typography
						variant="h4"
						align="center"
						gutterBottom
						sx={{
							fontWeight: "900",
							fontFamily: "Impact, sans-serif",
							letterSpacing: 2,
							color: "#ff1744",
							textShadow: "0 0 10px #ff1744",
						}}
					>
						🤡 JUGGLER 🤡
					</Typography>

					{/* 所持コイン */}
					<Box
						sx={{
							bgcolor: "#1e1e24",
							color: "#00ff66",
							p: 2,
							borderRadius: 2,
							mb: 3,
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							flexWrap: "wrap",
							gap: 1,
							border: "1px solid #333",
						}}
					>
						<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
							<AccountBalanceWalletIcon sx={{ color: "#aaa" }} />
							<Typography variant="subtitle1" sx={{ color: "#aaa" }}>
								所持コイン:
							</Typography>
						</Stack>
						<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
							<Typography
								variant="h4"
								fontFamily="monospace"
								sx={{ fontWeight: "bold" }}
							>
								{balance.toLocaleString()} コイン
							</Typography>
							<Button
								size="small"
								variant="outlined"
								color="success"
								onClick={handleAddCoins}
								disabled={isAddingCoins || isSpinning}
								startIcon={<AddCardIcon />}
								sx={{ ml: 1, borderColor: "#00ff66", color: "#00ff66" }}
							>
								+1000円
							</Button>
						</Stack>
					</Box>

					{/* カウンター */}
					<Paper
						sx={{ p: 1.5, bgcolor: "#0a0a0d", border: "1px solid #333", mb: 3 }}
					>
						<Stack
							direction="row"
							justifyContent="space-around"
							textAlign="center"
						>
							<Box>
								<Typography variant="caption" color="#aaa">
									ゲーム数
								</Typography>
								<Typography
									variant="h5"
									fontFamily="monospace"
									fontWeight="bold"
									color="#00e5ff"
								>
									{games} G
								</Typography>
							</Box>
							<Box>
								<Typography variant="caption" color="#aaa">
									BIG (BB)
								</Typography>
								<Typography
									variant="h5"
									fontFamily="monospace"
									fontWeight="bold"
									color="#ff1744"
								>
									{bbCount}
								</Typography>
							</Box>
							<Box>
								<Typography variant="caption" color="#aaa">
									REG (RB)
								</Typography>
								<Typography
									variant="h5"
									fontFamily="monospace"
									fontWeight="bold"
									color="#ffc107"
								>
									{rbCount}
								</Typography>
							</Box>
						</Stack>
					</Paper>

					{/* GOGO! ＆ 回転リール */}
					<Box
						sx={{
							position: "relative",
							bgcolor: "#000",
							borderRadius: 3,
							p: 3,
							mb: 3,
							border: "2px solid #222",
							textAlign: "center",
						}}
					>
						{/* GOGO! LAMP (justify 属性を justifyContent に修正) */}
						<Box
							sx={{
								width: 140,
								height: 60,
								mx: "auto",
								mb: 3,
								borderRadius: 2,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								bgcolor: isGogoLit ? "#ff0055" : "#1a0008",
								boxShadow: isGogoLit
									? "0 0 35px #ff0055, inset 0 0 15px #ffffff"
									: "none",
								transition: "all 0.1s ease-in-out",
								border: isGogoLit ? "2px solid #fff" : "1px solid #330011",
							}}
						>
							<Typography
								variant="h5"
								sx={{
									fontWeight: "900",
									fontStyle: "italic",
									fontFamily: "Impact, sans-serif",
									color: isGogoLit ? "#fff" : "#44001a",
									textShadow: isGogoLit
										? "0 0 10px #ffff00, 0 0 20px #ff0055"
										: "none",
									letterSpacing: 2,
								}}
							>
								GOGO!
							</Typography>
						</Box>

						{/* 3つのリール */}
						<Stack
							direction="row"
							spacing={2}
							justifyContent="center"
							sx={{ mb: 1 }}
						>
							{reels.map((symbol, idx) => {
								const reelKey = `${symbol}-${idx}`;

								return (
									<Paper
										key={reelKey}
										elevation={4}
										sx={{
											width: 70,
											height: 80,
											overflow: "hidden",
											position: "relative",
											bgcolor: "#fff",
											borderRadius: 2,
											border: "3px solid #333",
										}}
									>
										{isSpinning ? (
											<Box
												sx={{
													display: "flex",
													flexDirection: "column",
													alignItems: "center",
													animation: `reelSpin ${0.15 + idx * 0.05}s linear infinite`,
													filter: "blur(0.5px)",
												}}
											>
												{[...SPIN_SYMBOLS, ...SPIN_SYMBOLS].map((s, sIdx) => {
													const spinKey = `${s}-${sIdx}`;
													return (
														<Box
															key={spinKey}
															sx={{
																height: 80,
																display: "flex",
																alignItems: "center",
																justifyContent: "center",
																fontSize:
																	s === "7" || s === "BAR"
																		? "1.8rem"
																		: "2.2rem",
																fontWeight: "900",
																color: s === "7" ? "#d32f2f" : "#111",
															}}
														>
															{s}
														</Box>
													);
												})}
											</Box>
										) : (
											<Box
												sx={{
													width: "100%",
													height: "100%",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													color: symbol === "7" ? "#d32f2f" : "#111",
													fontSize:
														symbol === "7" || symbol === "BAR"
															? "1.8rem"
															: "2.2rem",
													fontWeight: "900",
												}}
											>
												{symbol}
											</Box>
										)}
									</Paper>
								);
							})}
						</Stack>
					</Box>

					{/* 当選表示 */}
					{lastBonus && (
						<Alert
							severity="success"
							variant="filled"
							icon={<FlashOnIcon fontSize="inherit" />}
							sx={{
								mb: 3,
								fontWeight: "bold",
								fontSize: "1.2rem",
								bgcolor: lastBonus === "BB" ? "#ff1744" : "#ff9800",
								boxShadow: "0 0 15px rgba(255,23,68,0.5)",
							}}
						>
							🎰 GOGO! ペカッ!! 【
							{lastBonus === "BB" ? "BIG BONUS" : "REG BONUS"}】 獲得！ (+
							{payoutAmount.toLocaleString()} コイン)
						</Alert>
					)}

					{/* ボタン */}
					<Button
						fullWidth
						variant="contained"
						color="error"
						size="large"
						disabled={isSpinning || balance < BET_COINS}
						onClick={spinReel}
						startIcon={
							isSpinning ? (
								<CircularProgress size={24} color="inherit" />
							) : (
								<CasinoIcon />
							)
						}
						sx={{
							py: 2,
							fontWeight: "bold",
							fontSize: "1.3rem",
							borderRadius: 3,
							boxShadow: "0 0 15px rgba(211, 47, 47, 0.4)",
						}}
					>
						{isSpinning ? "回転中..." : `1レバーON (${BET_COINS} コイン)`}
					</Button>

					<Stack
						direction="row"
						justifyContent="space-between"
						sx={{ mt: 2, px: 1 }}
					>
						<Chip
							label="BB: 3,000コイン (300枚)"
							size="small"
							color="error"
							variant="outlined"
						/>
						<Chip
							label="RB: 1,000コイン (100枚)"
							size="small"
							color="warning"
							variant="outlined"
						/>
					</Stack>
				</CardContent>
			</Card>
		</Box>
	);
}
