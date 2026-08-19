"use client";

import {
	Box,
	Button,
	Card,
	CardContent,
	Container,
	LinearProgress,
	Stack,
	Typography,
} from "@mui/material";
import { useCallback, useState } from "react";

type GameState = "idle" | "playing" | "finished";

type ExerciseGameProps = {
	initialSatiation: number;
	initialHappiness: number;
	onComplete?: (satiation: number, happiness: number) => void;
};

export default function ExerciseGame({
	initialSatiation,
	initialHappiness,
	onComplete,
}: ExerciseGameProps) {
	const [gameState, setGameState] = useState<GameState>("idle");
	const [satiation, setSatiation] = useState(initialSatiation);
	const [happiness, setHappiness] = useState(initialHappiness);
	const [tapCount, setTapCount] = useState(0);
	const [targets, setTargets] = useState<
		Array<{ id: string; x: number; y: number }>
	>([]);
	const [score, setScore] = useState(0);

	// ターゲットの生成（パーセンテージで管理することでレスポンシブに対応）
	const generateTarget = useCallback(() => {
		const id = Math.random().toString();
		// 画面からはみ出さないよう、ボタンサイズ分（約12%高・幅）のマージンを考慮
		const x = Math.floor(Math.random() * 85); // 0% 〜 85%
		const y = Math.floor(Math.random() * 65); // 0% 〜 65% (下部のメーター被りを防止)

		return { id, x, y };
	}, []);

	const startGame = () => {
		setGameState("playing");
		setSatiation(initialSatiation);
		setHappiness(initialHappiness);
		setTapCount(0);
		setScore(0);
		setTargets([generateTarget()]);
	};

	const handleTargetTap = (targetId: string) => {
		setTargets((prev) => prev.filter((t) => t.id !== targetId));
		setScore((prev) => prev + 1);

		const nextTapCount = tapCount + 1;
		setTapCount(nextTapCount);

		let currentSatiation = satiation;
		let currentHappiness = happiness;

		// 10タップごとにステータス更新
		if (nextTapCount % 10 === 0) {
			currentSatiation = Math.max(50, satiation - 1);
			currentHappiness = Math.min(100, happiness + 3);

			setSatiation(currentSatiation);
			setHappiness(currentHappiness);

			// 満腹度が50%以下になったら終了
			if (currentSatiation <= 50) {
				setGameState("finished");
				onComplete?.(currentSatiation, currentHappiness);
				return;
			}
		}

		// 次のターゲットを生成
		setTargets((prev) => [...prev, generateTarget()]);
	};

	return (
		<Container maxWidth="sm" sx={{ py: 4 }}>
			<Card>
				<CardContent>
					<Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
						💪 運動ゲーム
					</Typography>
					<Typography color="text.secondary" sx={{ mb: 3 }}>
						ターゲットをタップして運動しましょう。満腹度が50%になると終了します。
					</Typography>

					{gameState === "idle" && (
						<Stack spacing={2}>
							<Box>
								<Typography variant="body2" color="text.secondary">
									満腹度
								</Typography>
								<LinearProgress
									variant="determinate"
									value={satiation}
									sx={{ mb: 1 }}
								/>
								<Typography variant="body2">{satiation}%</Typography>
							</Box>

							<Box>
								<Typography variant="body2" color="text.secondary">
									幸福度
								</Typography>
								<LinearProgress
									variant="determinate"
									value={happiness}
									sx={{ mb: 1 }}
								/>
								<Typography variant="body2">{happiness}%</Typography>
							</Box>

							<Button
								variant="contained"
								onClick={startGame}
								fullWidth
								size="large"
							>
								ゲーム開始
							</Button>
						</Stack>
					)}

					{gameState === "playing" && (
						<Box
							sx={{
								position: "relative",
								width: "100%",
								height: "400px",
								backgroundColor: "#f5f5f5",
								borderRadius: 1,
								overflow: "hidden",
								mb: 2,
							}}
						>
							<Typography
								sx={{
									position: "absolute",
									top: 10,
									left: 10,
									zIndex: 10,
									fontWeight: "bold",
								}}
							>
								スコア: {score}
							</Typography>

							{targets.map((target) => (
								<Button
									key={target.id}
									onClick={() => handleTargetTap(target.id)}
									sx={{
										position: "absolute",
										left: `${target.x}%`,
										top: `${target.y}%`,
										width: "50px",
										height: "50px",
										borderRadius: "50%",
										backgroundColor: "#5865f2",
										color: "white",
										fontSize: "24px",
										padding: 0,
										minWidth: "50px",
										zIndex: 5,
										"&:hover": {
											backgroundColor: "#4752c4",
										},
									}}
								>
									●
								</Button>
							))}

							{/* 満腹度表示エリア */}
							<Box
								sx={{
									position: "absolute",
									bottom: 0,
									left: 0,
									right: 0,
									p: 2,
									backgroundColor: "rgba(255, 255, 255, 0.85)",
									zIndex: 10,
								}}
							>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ mb: 0.5 }}
								>
									満腹度
								</Typography>
								<LinearProgress
									variant="determinate"
									value={satiation}
									sx={{ mb: 0.5 }}
								/>
								<Typography variant="body2">{satiation}%</Typography>
							</Box>
						</Box>
					)}

					{gameState === "finished" && (
						<Stack spacing={2}>
							<Typography variant="h6" align="center">
								ゲーム終了！
							</Typography>

							<Box>
								<Typography variant="body2" color="text.secondary">
									最終スコア
								</Typography>
								<Typography variant="h4">{score}</Typography>
							</Box>

							<Box>
								<Typography variant="body2" color="text.secondary">
									満腹度
								</Typography>
								<LinearProgress
									variant="determinate"
									value={satiation}
									sx={{ mb: 1 }}
								/>
								<Typography variant="body2">{satiation}%</Typography>
							</Box>

							<Box>
								<Typography variant="body2" color="text.secondary">
									幸福度
								</Typography>
								<LinearProgress
									variant="determinate"
									value={happiness}
									sx={{ mb: 1 }}
								/>
								<Typography variant="body2">{happiness}%</Typography>
							</Box>

							<Button variant="contained" onClick={startGame} fullWidth>
								もう一度プレイ
							</Button>
						</Stack>
					)}
				</CardContent>
			</Card>
		</Container>
	);
}
