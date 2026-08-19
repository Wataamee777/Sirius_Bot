"use client";

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddCardIcon from "@mui/icons-material/AddCard";
import CasinoIcon from "@mui/icons-material/Casino";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	CircularProgress,
	Divider,
	FormControl,
	FormControlLabel,
	FormLabel,
	InputAdornment,
	Radio,
	RadioGroup,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

import { addTestCoins } from "@/lib/testcoins";

const MUI_COLORS = ["error", "primary", "success", "warning"] as const;
type HorseColor = (typeof MUI_COLORS)[number];

type BetType = "win" | "place";
type RaceState = "IDLE" | "PREPARING" | "RUNNING" | "FINISHED";

interface Horse {
	id: number;
	name: string;
	color: HorseColor;
	winOdds: number;
	placeOdds: number;
}

interface RaceHorse {
	id: number;
	name: string;
	winOdds?: number;
	placeOdds?: number;
	odds?: number;
	color: HorseColor;
}

interface HorseRaceProps {
	initialBalance: number | bigint;
	discordId: string;
}

export default function HorseRace({
	initialBalance,
	discordId,
}: HorseRaceProps) {
	const [balance, setBalance] = useState<bigint>(BigInt(initialBalance));
	const [horses, setHorses] = useState<Horse[]>([]);
	const [raceId, setRaceId] = useState<string | null>(null);
	const [raceState, setRaceState] = useState<RaceState>("IDLE");
	const [isLoadingHorses, setIsLoadingHorses] = useState<boolean>(true);
	const [isAddingCoins, setIsAddingCoins] = useState<boolean>(false);

	const [selectedHorseIndex, setSelectedHorseIndex] = useState<number | null>(
		null,
	);
	const [betType, setBetType] = useState<BetType>("win");
	const [betAmount, setBetAmount] = useState<number>(1000);

	const [results, setResults] = useState<number[]>([]);
	const [apiResponse, setApiResponse] = useState<{
		payout: bigint;
		isHit: boolean;
	} | null>(null);

	// 💡 再レンダリングを回避するための useRef 群
	const progressRef = useRef<number[]>([]); // 各馬の進捗率 (0.0 〜 1.0)
	const animFrameId = useRef<number | null>(null);
	const resultsRef = useRef<number[]>([]);

	// 🐴 出走馬データの取得 (GET)
	const fetchActiveHorses = useCallback(async () => {
		setIsLoadingHorses(true);
		setApiResponse(null);
		setResults([]);
		setSelectedHorseIndex(null);
		setRaceState("IDLE");

		try {
			const response = await fetch("/api/economy/race");
			const data = await response.json();
			const payload = data as {
				raceId?: string;
				activeHorses?: Array<RaceHorse>;
			};

			if (payload.raceId) setRaceId(payload.raceId);

			if (payload.activeHorses) {
				const formattedHorses = payload.activeHorses.map((horse, idx) => ({
					...horse,
					winOdds: horse.winOdds ?? horse.odds ?? 1.0,
					placeOdds:
						horse.placeOdds ??
						Math.max(1.1, (horse.winOdds ?? horse.odds ?? 1.0) * 0.4),
					color: MUI_COLORS[idx % MUI_COLORS.length] as HorseColor,
				}));
				setHorses(formattedHorses);
				progressRef.current = new Array(formattedHorses.length).fill(0);
				updateHorseDOMs(progressRef.current);
			}
		} catch (error) {
			console.error("出走馬の取得に失敗しました:", error);
		} finally {
			setIsLoadingHorses(false);
		}
	}, []);

	useEffect(() => {
		fetchActiveHorses();
	}, [fetchActiveHorses]);

	// コンポーネント破棄時にアニメーションフレームをクリーンアップ
	useEffect(() => {
		return () => {
			if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
		};
	}, []);

	// ⚡ DOMを直接操作（GPUアクセラレーションを活用して再レンダリングゼロで駆動）
	// ⚡ DOMを直接操作（コース幅を取得してpx単位で動かす）
	function updateHorseDOMs(progresses: number[]) {
		// 画面上のコース（.race-track）の幅を取得
		const trackEl = document.querySelector(".race-track");
		// コース幅から「馬の幅(40px)」と「ゴールラインの余白(約20px)」を考慮して走行距離を算出
		const trackWidth = trackEl ? trackEl.clientWidth - 50 : 300;

		progresses.forEach((p, index) => {
			const el = document.getElementById(`horse-anim-${index}`);
			if (el) {
				// % ではなく px 指定に変更！
				const currentX = p * trackWidth;
				el.style.transform = `translateX(${currentX}px)`;
			}
		});
	}

	// 🏎️ アニメーションループ (requestAnimationFrame)
	const startAnimationLoop = (
		serverRankResult: number[],
		finalBalance: number | bigint | string,
		serverPayout: number | bigint | string,
		serverIsHit: boolean,
	) => {
		let lastTime = performance.now();
		resultsRef.current = [];

		const loop = (currentTime: number) => {
			const deltaTime = (currentTime - lastTime) / 1000; // フレーム間経過時間（秒）
			lastTime = currentTime;

			let allFinished = true;

			const newProgress = progressRef.current.map((p, index) => {
				if (p >= 1.0) return 1.0;

				allFinished = false;

				const horseId = horses[index]?.id;
				const rank = serverRankResult.indexOf(horseId) + 1;

				// 着順に応じた補正（上位ほど速く）
				const speedBias = rank > 0 ? (horses.length - rank) * 0.04 : 0;

				// 💡 基礎スピードを 0.15 → 0.35 に変更（約5〜7秒で決着）
				const baseSpeed = 0.35 + Math.random() * 0.12 + speedBias;

				const nextProgress = Math.min(1.0, p + baseSpeed * deltaTime);

				// ゴール判定
				if (nextProgress >= 1.0 && !resultsRef.current.includes(horseId)) {
					resultsRef.current.push(horseId);
					setResults([...resultsRef.current]);
				}

				return nextProgress;
			});

			progressRef.current = newProgress;
			updateHorseDOMs(newProgress);

			if (!allFinished) {
				animFrameId.current = requestAnimationFrame(loop);
			} else {
				// 全頭ゴール完了
				setRaceState("FINISHED");
				setBalance(BigInt(finalBalance));
				setApiResponse({ payout: BigInt(serverPayout), isHit: serverIsHit });
			}
		};

		animFrameId.current = requestAnimationFrame(loop);
	};

	// 🚀 レース開始（フェーズ管理：IDLE → PREPARING → RUNNING → FINISHED）
	const startRace = async () => {
		if (selectedHorseIndex === null) return;
		if (!raceId)
			return alert("レース情報が読み込めていません。再読み込みしてください。");
		if (BigInt(betAmount) > balance) return alert("コインが足りません！");
		if (betAmount <= 0) return alert("1コイン以上賭けてください！");

		// 1. 【即時反応】まず「準備（ゲートイン）」状態にして画面の初期化を行う
		setRaceState("PREPARING");
		setApiResponse(null);
		setResults([]);
		progressRef.current = new Array(horses.length).fill(0);
		updateHorseDOMs(progressRef.current);

		try {
			// 2. 通信中（通信待機中も画面はPREPARING状態として破綻しない）
			const response = await fetch("/api/economy/race", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					discordId,
					raceId,
					selectedHorseIndex,
					betType,
					betAmount,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				alert(data.error || "エラーが発生しました");
				setRaceState("IDLE");
				return;
			}

			// 3. 通信成功したら「出走中」状態にし、60fpsアニメーションループ開始
			setRaceState("RUNNING");
			startAnimationLoop(
				data.rankResult,
				data.newBalance,
				data.payout,
				data.isHit,
			);
		} catch (error) {
			console.error(error);
			alert("通信エラーが発生しました。");
			setRaceState("IDLE");
		}
	};

	const handleAddCoins = async () => {
		setIsAddingCoins(true);
		const result = await addTestCoins(discordId, 1000);
		if (result.success && result.coins !== undefined) {
			setBalance(BigInt(result.coins));
		} else {
			alert(result.error || "コインの加算に失敗しました。");
		}
		setIsAddingCoins(false);
	};

	const isBusy = raceState !== "IDLE" && raceState !== "FINISHED";

	return (
		<Box sx={{ maxWidth: 650, mx: "auto", p: 2 }}>
			<Card
				raised
				sx={{
					borderRadius: 3,
					bgcolor: "#fafafa",
					border: "1px solid #e0e0e0",
				}}
			>
				<CardContent>
					<Typography
						variant="h5"
						align="center"
						gutterBottom
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: 1,
							fontWeight: "bold",
						}}
					>
						🏁 Sirius 競馬 🏁
					</Typography>

					{/* ウォレット表示 */}
					<Box
						sx={{
							bgcolor: "#1e1e1e",
							color: "#00ff66",
							p: 2,
							borderRadius: 2,
							mb: 3,
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							flexWrap: "wrap",
							gap: 1,
						}}
					>
						<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
							<AccountBalanceWalletIcon sx={{ color: "#aaa" }} />
							<Typography variant="subtitle1" sx={{ color: "#aaa" }}>
								電子ウォレット残高:
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
								disabled={isAddingCoins || isBusy}
								startIcon={<AddCardIcon />}
								sx={{
									ml: 1,
									borderColor: "#00ff66",
									color: "#00ff66",
									"&:hover": {
										borderColor: "#00cc52",
										bgcolor: "rgba(0,255,102,0.1)",
									},
								}}
							>
								+1000円
							</Button>
						</Stack>
					</Box>

					<FormControl disabled={isBusy} fullWidth sx={{ mb: 3 }}>
						<FormLabel sx={{ mb: 0.5, color: "#333", fontWeight: "bold" }}>
							① 馬券の種類を選択
						</FormLabel>
						<RadioGroup
							row
							value={betType}
							onChange={(e) => setBetType(e.target.value as BetType)}
						>
							<FormControlLabel
								value="win"
								control={<Radio color="secondary" />}
								label="単勝 (1着を当てる)"
							/>
							<FormControlLabel
								value="place"
								control={<Radio color="secondary" />}
								label="複勝 (3着以内に入ればOK)"
							/>
						</RadioGroup>
					</FormControl>

					<FormControl
						fullWidth
						disabled={isBusy || isLoadingHorses}
						sx={{ mb: 3 }}
					>
						<FormLabel sx={{ mb: 1, color: "#333", fontWeight: "bold" }}>
							② 出走馬 ＆ オッズ
						</FormLabel>
						{isLoadingHorses ? (
							<Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
								<CircularProgress color="secondary" />
							</Box>
						) : (
							<Stack spacing={1}>
								{horses.map((horse, index) => {
									const currentOdds =
										betType === "win" ? horse.winOdds : horse.placeOdds;
									const isSelected = selectedHorseIndex === index;
									return (
										<Button
											key={horse.id}
											variant={isSelected ? "contained" : "outlined"}
											color={horse.color}
											onClick={() => setSelectedHorseIndex(index)}
											sx={{
												justifyContent: "space-between",
												px: 3,
												py: 1.2,
												borderRadius: 2,
												borderWidth: isSelected ? 2 : 1,
												"&:hover": { borderWidth: 2 },
											}}
										>
											<Box
												sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
											>
												<Typography variant="body1" fontWeight="bold">
													【{index + 1}枠】
												</Typography>
												<Typography variant="body1" fontWeight="bold">
													{horse.name}
												</Typography>
											</Box>
											<Typography
												variant="body2"
												fontWeight="bold"
												sx={{ opacity: 0.9 }}
											>
												{betType === "win" ? "単勝" : "複勝"}:{" "}
												{currentOdds ? currentOdds.toFixed(1) : "1.0"}倍
											</Typography>
										</Button>
									);
								})}
							</Stack>
						)}
					</FormControl>

					<TextField
						label="③ 投票するコイン額"
						type="number"
						fullWidth
						disabled={isBusy}
						value={betAmount}
						onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">🪙</InputAdornment>
							),
						}}
						sx={{ mb: 3 }}
					/>

					<Button
						fullWidth
						size="large"
						variant="contained"
						color="secondary"
						onClick={startRace}
						disabled={
							isBusy ||
							isLoadingHorses ||
							selectedHorseIndex === null ||
							BigInt(betAmount) > balance ||
							betAmount <= 0
						}
						startIcon={<CasinoIcon />}
						sx={{
							mb: 4,
							fontWeight: "bold",
							height: 52,
							borderRadius: 2,
							fontSize: "1.1rem",
						}}
					>
						{raceState === "PREPARING" && "ゲートイン・発走準備中..."}
						{raceState === "RUNNING" && "各馬 一斉にスタートしました！"}
						{raceState === "IDLE" && "馬券を投票してゲートイン！"}
						{raceState === "FINISHED" && "次のレースへ投票"}
					</Button>

					<Divider sx={{ mb: 3 }}>LIVE RACE TRACK</Divider>

					<Stack
						spacing={2}
						sx={{
							bgcolor: "#1b5e20",
							p: 2.5,
							borderRadius: 3,
							border: "3px solid #113f14",
							boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)",
						}}
					>
						{horses.map((horse, index) => {
							const currentRank = results.indexOf(horse.id) + 1;
							const isSelected = selectedHorseIndex === index;

							return (
								<Box key={horse.id ?? index}>
									<Stack
										direction="row"
										justifyContent="space-between"
										sx={{ mb: 0.5, color: "#fff" }}
									>
										<Typography
											variant="caption"
											fontWeight="bold"
											sx={{
												color: isSelected ? "#ffeb3b" : "#fff",
												fontSize: isSelected ? "0.85rem" : "0.75rem",
											}}
										>
											{horse.name
												? `${index + 1}番線: ${horse.name}`
												: `${index + 1}番線`}
											{isSelected && " 🎯 (あなたの賭け馬)"}
										</Typography>

										{currentRank > 0 && (
											<Typography
												variant="caption"
												sx={{
													color: currentRank === 1 ? "#ffd700" : "#fff",
													fontWeight: "bold",
												}}
											>
												{currentRank}着でゴール!
											</Typography>
										)}
									</Stack>

									<Box
										className="race-track"
										sx={{
											display: "flex",
											alignItems: "center",
											position: "relative",
											height: 38,
											bgcolor: "#2e7d32",
											borderRadius: 1.5,
											overflow: "hidden",
											border: isSelected
												? "2px solid #ffeb3b"
												: "1px dashed #4caf50",
										}}
									>
										{/* ゴールライン */}
										<Box
											sx={{
												position: "absolute",
												right: 12,
												top: 0,
												bottom: 0,
												width: 4,
												bgcolor: "#ff1744",
												borderLeft: "2px dashed #fff",
												zIndex: 1,
											}}
										/>

										{/* 🐎 動きを担当する要素（will-change指定でGPUアクセラレーションを明示） */}
										<Box
											id={`horse-anim-${index}`}
											sx={{
												position: "absolute",
												left: 0,
												bottom: 2,
												zIndex: 2,
												width: 40,
												height: 40,
												willChange: "transform",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="30"
												height="30"
												viewBox="0 0 36 36"
											>
												<g transform="matrix(-1 0 0 1 36 0)">
													<path
														xmlns="http://www.w3.org/2000/svg"
														fill="#292f33"
														d="M28.721 12.849s3.809 1.643 5.532.449q2.585-1.79 1.159-4.736C34.461 6.601 31.789 5.83 31.7 3.27c0 0-.298 4.141 1.513 5.505 2.562 1.933-.446 4.21-3.522 3.828-3.078-.382-.97.246-.97.246"
													/>
													<path
														xmlns="http://www.w3.org/2000/svg"
														fill="#8a4b38"
														d="M23.875 19.375s-.628 2.542.187 5.03c.145.341.049.556-.208.678-.256.122-4.294 1.542-4.729 1.771-.396.208-1.142 1.78-1.208 2.854.844.218 1.625.104 1.625.104s.025-1.915.208-2.042 5.686-1.048 6.062-1.771 1.611-3.888.812-5.292c-.225-.395-.637-1.15-.637-1.15z"
													/>
													<path
														xmlns="http://www.w3.org/2000/svg"
														fill="#292f33"
														d="M17.917 29.708s-.616 1.993.008 2.138c.605.141 1.694-.388 1.755-.646.081-.343.216-1.179.098-1.366-.118-.186-1.861-.126-1.861-.126"
													/>
													<path
														xmlns="http://www.w3.org/2000/svg"
														fill="#8a4b38"
														d="m11.812 21.875-.75-2.562s-2.766 2.105-3.938 3.594c-.344.437-1.847 3.198-1.722 4.413.05.488.474 2.583.474 2.583l1.651-.465s-1.312-1.896-1.021-2.562c1.428-3.263 5.306-5.001 5.306-5.001"
													/>
													<path
														xmlns="http://www.w3.org/2000/svg"
														fill="#292f33"
														d="M7.679 29.424c-.172-.139-1.803.479-1.803.479s.057 2.085.695 2.022c.618-.061 1.48-.912 1.455-1.175-.034-.351-.175-1.187-.347-1.326"
													/>
													<path
														xmlns="http://www.w3.org/2000/svg"
														fill="#c1694f"
														d="M27.188 11.188c-3.437.156-7.207.438-9.5.438-3.655 0-5.219-1.428-6.562-2.625C8.838 6.964 8.167 4.779 6 5.501c0 0-.632-.411-1.247-.778l-.261-.152a7 7 0 0 0-.656-.347c-.164-.072-.258-.087-.228-.01.019.051.093.143.236.286.472.472.675.95.728 1.395-2.01 1.202-2.093 2.276-2.871 3.552-.492.807-1.36 2.054-1.56 2.515-.412.948 1.024 2.052 1.706 1.407.893-.845.961-1.122 2.032-1.744.983-.016 1.975-.416 2.308-1.02 0 0 .938 2.083 1.938 3.583s2.5 3.125 2.5 3.125c-.131 1.227.12 2.176.549 2.922-.385.757-.924 1.807-1.417 2.745-.656 1.245-1.473 3.224-1.208 3.618.534.798 2.719 2.926 4.137 3.311 1.03.28 2.14.437 2.14.437l-.193-1.574s-1.343.213-1.875-.083c-1.427-.795-2.666-2.248-2.708-2.542-.07-.487 3.841-2.868 5.14-3.645 2.266.097 6.022-.369 8.626-1.702.958 1.86 2.978 2.513 2.978 2.513s.667 2.208 1.375 4.125c-1.017.533-4.468 3.254-4.975 3.854-.456.54-.856 2.49-.856 2.49.82.375 1.57.187 1.57.187s.039-1.562.385-2.073 4.701-2.559 5.958-3.458c.492-.352.404-.903.262-1.552-.321-1.471-.97-4.781-.971-4.782 5.146-2.979 6.458-11.316-2.354-10.916"
													/>
													<path
														xmlns="http://www.w3.org/2000/svg"
														fill="#292f33"
														d="M22.336 33.782s-.616 1.993.008 2.138c.605.141 1.694-.388 1.755-.646.081-.343.216-1.179.098-1.366s-1.861-.126-1.861-.126m-7.676-5.296c-.167.146.164 1.859.164 1.859s2.064.299 2.111-.34c.045-.62-.647-1.614-.91-1.634-.351-.027-1.198-.031-1.365.115"
													/>
													<path
														xmlns="http://www.w3.org/2000/svg"
														fill="#ffac33"
														d="M25.103 11.282c-3.295.135-9.103.499-10.4-.079.063 1.922-.676 3.605.3 6.865.46.101 8.122.244 10.935-.912-.672-2.862-.389-3.993-.835-5.874"
													/>
													<path
														xmlns="http://www.w3.org/2000/svg"
														fill="#623120"
														d="M15.891 11.438s-.759 3.543 2.408 3.63 2.792-2.247 3.045-2.505 2.718-.391 2.718-1.064c0-.233-1.269-.127-1.874-.099-.303.014-3.589.204-6.297.038"
													/>
													<path
														xmlns="http://www.w3.org/2000/svg"
														fill="#5c913b"
														d="M6.094 5.706c-.682.47-1.67.286-1.67.286-.594.25-1.524 1.156-1.93 1.937S.969 10.593.969 10.593s1.094.865 1.719 1.906c0 0 .531-.531 1.192-.875 1.942-.063 2.308-1.02 2.308-1.02s.031-2.992-.094-4.898M4.321 8.467a.46.46 0 0 1-.46-.459.46.46 0 0 1 .919 0 .46.46 0 0 1-.459.459"
													/>
													<circle
														xmlns="http://www.w3.org/2000/svg"
														cx="4.25"
														cy="8.047"
														r=".349"
														fill="#292f33"
													/>
													<path
														xmlns="http://www.w3.org/2000/svg"
														fill="#f5f8fa"
														d="M4.321 7.099a.91.91 0 0 0 0 1.818.91.91 0 0 0 0-1.818m0 1.368a.46.46 0 0 1-.46-.459.46.46 0 0 1 .919 0 .46.46 0 0 1-.459.459m-1.785 4.185L.765 10.9l.253-.388 1.841 1.817zm3.568-6.953.449-.009.093 4.898-.449.009z"
													/>
													<path
														xmlns="http://www.w3.org/2000/svg"
														fill="#292f33"
														d="M12.655 9.07c1.773 1.446 3.147.322 3.147.322-1.295-.271-2.056-.867-2.708-1.562.835-.131 1.287-.666 1.287-.666-1.061-.013-1.824-.3-2.485-.699-.565-.614-1.233-1.202-2.254-1.631a5 5 0 0 0-.922-.276c-.086-.025-.178-.063-.258-.073a4.13 4.13 0 0 0-2.737.603c-.322.2-.214.639.117.623 1.741-.085 2.866.582 3.47 1.633 2.169 3.772 5.344 3.875 5.344 3.875s-1.29-.688-2.001-2.149m5.11 13.33-.361-7.566 1.029.228.45 7.208c-.377.071-1.118.13-1.118.13"
													/>
													<path
														xmlns="http://www.w3.org/2000/svg"
														fill="#623120"
														d="M2.354 12.75a.5.5 0 0 1-.203-.956C8.29 9.058 13.369 9.059 13.628 9.047a.5.5 0 0 1-.003 1h-.004c-.104 0-5.15.025-11.063 2.66a.5.5 0 0 1-.204.043"
													/>
													<path
														xmlns="http://www.w3.org/2000/svg"
														fill="#f6ddcd"
														d="M18.875 5.516c-.438-1.469-3.256-1.231-3.077-2.591l-.121.243a2.2 2.2 0 0 0-.171-.62c-.45-.997-1.522-1.486-2.394-1.092-.756.341-1.738.349-1.341 1.636.061.197.134.451.248.703.452.996 1.849 1.665 2.722 1.271.05-.022.091-.055.137-.082.207.123.84.506 1.864 1.205 1.207.823 2.568.797 2.133-.673"
													/>
													<path
														xmlns="http://www.w3.org/2000/svg"
														fill="#292f33"
														d="M11.889 1.419c.256-.5 1.301-1.065 2.192-1.01 1.005.063 1.564.76 1.795 1.633.114.43.045.914-.043 1.27 0 0-.965-.087-.858-.15.198-.117.034-.815-.218-.907-.265-.097-.361.163-.324.364s.032.324-.08.398-.489-.502-.765-.614c-.455-.185-1.491 1.132-1.816.69-.202-.276-.2-1.055.117-1.674"
													/>
													<path
														xmlns="http://www.w3.org/2000/svg"
														fill="#9266cc"
														d="M13.163 2.849s1.582-.754 1.988-.869.603-.166.671-.252c.067-.086-.103-.225-.178-.316s-.44-.974-1.275-1.243c-.696-.224-1.202-.111-1.583.045s-1.184.512-1.366 1.842c-.096.745.038 1.145.038 1.145s-.476.136-.523.144-.042.126.179.181 1.292-.068 1.64-.231.318-.371.409-.446"
													/>
													<path
														xmlns="http://www.w3.org/2000/svg"
														d="M20.828 14.172c-.186-.532-.248-.716-.554-1.524-.1-.264-.219-.585-.369-.993l-1.934.745c.176.383.313.688.426.946.364.832.475 1.321.592 1.877l-.801.291c-.387.168-.811.333-.858.933-.036.462.341.424.635.388.433-.052 3.093-.506 3.223-.788.117-.257-.139-1.243-.36-1.875"
													/>
													<path
														xmlns="http://www.w3.org/2000/svg"
														fill="#ccd6dd"
														d="M17.971 12.4s-.2-.506-.395-1.169c-.376-1.282-.565-2.314 3.451-3.335a2 2 0 0 0-.099-.152c-1.324-1.858-4.253-3.696-3.491-3.815 3.832-.601 5.007-.007 6.684 2.349.827 1.162.936 1.593.784 2.191-.59 2.328-5.15 1.272-5 3.186z"
													/>
													<path
														xmlns="http://www.w3.org/2000/svg"
														fill="#5c913b"
														d="M17.439 7.086c1.535 1.055 2.339-.154 3.588.81l3.277-1.322c-1.281-2.465-4.879-4.553-7.86-3.024-.693.355-1.185 1.024-1.041 1.804.289 1.56 1.405 1.299 2.036 1.732"
													/>
													<path
														xmlns="http://www.w3.org/2000/svg"
														fill="#a6d388"
														d="M17.937 5.153c-.031-.08-.117-.287-.179-.356-.3-.419-.842-.609-1.34-.406a1.14 1.14 0 0 0-.626 1.487c.924 2.413 1.142 2.651 1.032 2.839-.03.03-.348.284-2.323.09L14 9v1l.305.797c1.924.189 3.359.114 4.107-.865.879-1.152.428-2.421-.475-4.779"
													/>
													<path
														xmlns="http://www.w3.org/2000/svg"
														fill="#f6ddcd"
														d="M14.502 8.807c-1.893-1.191-2.035.25-2.089.799-.054.55-.098.995 1.893 1.191z"
													/>
													<path
														xmlns="http://www.w3.org/2000/svg"
														fill="#aab8c2"
														d="m18.273 15.478.447-.159c-.488-1.218-1.031-1.021-1.071-1.006-.2.076-.925 1.053-.316 2.516a.25.25 0 1 0 .462-.192c-.373-.896-.142-1.651.031-1.725.172-.073.411.302.447.566"
													/>
												</g>
											</svg>
										</Box>
									</Box>
								</Box>
							);
						})}
					</Stack>

					{apiResponse && (
						<Box sx={{ mt: 3 }}>
							{apiResponse.isHit ? (
								<Alert
									severity="success"
									variant="filled"
									sx={{
										fontSize: "1.05rem",
										fontWeight: "bold",
										borderRadius: 2,
										boxShadow: 3,
										mb: 2,
									}}
								>
									🎉 見事に的中！ 払戻金 【{apiResponse.payout.toLocaleString()}{" "}
									コイン】 があなたの口座に送金されました！
								</Alert>
							) : (
								<Alert
									severity="error"
									variant="filled"
									sx={{
										fontSize: "1.05rem",
										fontWeight: "bold",
										borderRadius: 2,
										boxShadow: 3,
										mb: 2,
									}}
								>
									❌ はずれ！
									今回の投資金は全額ハウスに没収されました。次回のレースに期待しましょう！
								</Alert>
							)}

							<Button
								fullWidth
								variant="outlined"
								color="primary"
								onClick={fetchActiveHorses}
								startIcon={<RefreshIcon />}
								sx={{ fontWeight: "bold", py: 1 }}
							>
								次のレースのパドックへ
							</Button>
						</Box>
					)}
				</CardContent>
			</Card>
		</Box>
	);
}
