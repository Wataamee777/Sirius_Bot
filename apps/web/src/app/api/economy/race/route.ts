import crypto from "node:crypto";
import { prisma } from "@sirius/database";
import { NextResponse } from "next/server";
import { logEconomyEvent } from "@/lib/economy-logger";

interface HorseData {
	name: string;
	baseWin: number;
	basePlace: number;
}

export interface ActiveHorse {
	id: number;
	name: string;
	winOdds: number;
	placeOdds: number;
	speed: number; // 💡 フロントのアニメーション・進行計算で使う基礎スピード
}

interface StoredRace {
	activeHorses: ActiveHorse[];
	createdAt: number;
}

// ----------------------------------------------------
// 設定値
// ----------------------------------------------------
const MIN_SPEED = 0.4; // 💡 【重要】どれだけオッズが高くても担保される最低速度（毎フレームの進捗量）
const MAX_SPEED = 1.8; // 最大速度制限

const HORSE_DATABASE: HorseData[] = [
	{ name: "トウカイテイオー", baseWin: 2.1, basePlace: 1.2 },
	{ name: "オグリキャップ", baseWin: 3.5, basePlace: 1.5 },
	{ name: "メジロマックイーン", baseWin: 5.2, basePlace: 1.8 },
	{ name: "サイレンススズカ", baseWin: 4.0, basePlace: 1.6 },
	{ name: "ディープインパクト", baseWin: 1.5, basePlace: 1.1 },
	{ name: "オルフェーヴル", baseWin: 2.8, basePlace: 1.3 },
	{ name: "ゴールドシップ", baseWin: 8.5, basePlace: 2.5 },
	{ name: "ハルウララ", baseWin: 88.0, basePlace: 18.0 },
	{ name: "キタサンブラック", baseWin: 3.0, basePlace: 1.4 },
	{ name: "アーモンドアイ", baseWin: 1.8, basePlace: 1.2 },
	{ name: "ソダシ", baseWin: 6.2, basePlace: 2.0 },
	{ name: "ウォッカ", baseWin: 4.5, basePlace: 1.7 },
	{ name: "ダイワスカーレット", baseWin: 3.8, basePlace: 1.4 },
	{ name: "ツインターボ", baseWin: 25.0, basePlace: 6.0 },
	{ name: "ライスシャワー", baseWin: 7.2, basePlace: 2.2 },
];

// 💡 サーバーメモリ上でレース情報を保持する Map
const raceStore = new Map<string, StoredRace>();

/**
 * 10分以上経過した古いレースキャッシュをクリーンアップ
 */
function cleanupRaceStore() {
	const now = Date.now();
	for (const [id, data] of raceStore.entries()) {
		if (now - data.createdAt > 10 * 60 * 1000) {
			raceStore.delete(id);
		}
	}
}

/**
 * 出走馬（9頭）をランダム生成する（オッズと基礎スピードの算出）
 */
function generateActiveHorses(): ActiveHorse[] {
	const shuffledPool = [...HORSE_DATABASE].sort(() => Math.random() - 0.5);

	return shuffledPool.slice(0, 9).map((horse, index) => {
		const conditionModifier = 0.85 + Math.random() * 0.3;

		const winOdds = Math.max(
			1.1,
			Math.round(horse.baseWin * conditionModifier * 10) / 10,
		);
		const placeOdds = Math.max(
			1.1,
			Math.round(horse.basePlace * conditionModifier * 10) / 10,
		);

		// 💡 オッズに応じた基礎スピードの計算
		// 本命（低オッズ）ほど基本速度が高く、穴馬（高オッズ）ほどやや低くなる計算
		const calculatedSpeed = 2.0 / Math.sqrt(winOdds);

		// 💡 【ポイント】Math.max で MIN_SPEED を強制設定し、絶対に 0 や超低速にならないようにガード
		const speed = Math.min(
			MAX_SPEED,
			Math.max(MIN_SPEED, Math.round(calculatedSpeed * 100) / 100),
		);

		return {
			id: index,
			name: horse.name,
			winOdds,
			placeOdds,
			speed,
		};
	});
}

/**
 * オッズに基づいた重み付け順位（着順）のシミュレーション
 */
function simulateRaceRankings(activeHorses: ActiveHorse[]): number[] {
	const pool = [...activeHorses];
	const rankings: number[] = [];

	while (pool.length > 0) {
		const weights = pool.map((h) => 1 / h.winOdds ** 1.2);
		const totalWeight = weights.reduce((sum, w) => sum + w, 0);

		let random = Math.random() * totalWeight;
		let selectedIndex = 0;

		for (let i = 0; i < pool.length; i++) {
			random -= weights[i];
			if (random <= 0) {
				selectedIndex = i;
				break;
			}
		}

		rankings.push(pool[selectedIndex].id);
		pool.splice(selectedIndex, 1);
	}

	return rankings;
}

// ----------------------------------------------------
// GET: 出走馬とレースIDの発行
// ----------------------------------------------------
export async function GET() {
	cleanupRaceStore();

	const activeHorses = generateActiveHorses();
	const raceId = crypto.randomUUID();

	// レース情報をメモリに保存
	raceStore.set(raceId, {
		activeHorses,
		createdAt: Date.now(),
	});

	return NextResponse.json({ raceId, activeHorses });
}

// ----------------------------------------------------
// POST: 賭けの実行とシミュレーション
// ----------------------------------------------------
export async function POST(request: Request) {
	const startCpu = process.cpuUsage();
	const startTime = performance.now();

	try {
		const body = await request.json();
		const { discordId, raceId, selectedHorseIndex, betType, betAmount } = body;

		// 1. パラメータバリデーション
		if (
			!discordId ||
			!raceId ||
			selectedHorseIndex === undefined ||
			!betType ||
			!betAmount
		) {
			return NextResponse.json(
				{ error: "リクエストパラメータが不足しています。" },
				{ status: 400 },
			);
		}

		if (betType !== "win" && betType !== "place") {
			return NextResponse.json(
				{ error: "不正な馬券タイプです。" },
				{ status: 400 },
			);
		}

		const betAmountNum = Math.floor(Number(betAmount));
		if (Number.isNaN(betAmountNum) || betAmountNum <= 0) {
			return NextResponse.json(
				{ error: "賭け金は1コイン以上の整数で指定してください。" },
				{ status: 400 },
			);
		}

		if (
			typeof selectedHorseIndex !== "number" ||
			selectedHorseIndex < 0 ||
			selectedHorseIndex > 8
		) {
			return NextResponse.json(
				{ error: "不正な馬の選択です。" },
				{ status: 400 },
			);
		}

		// 2. メモリから保存された該当レースの馬データを取得
		const storedRace = raceStore.get(raceId);
		if (!storedRace) {
			return NextResponse.json(
				{ error: "有効なレース情報が見つかりません。画面を更新してください。" },
				{ status: 400 },
			);
		}

		const { activeHorses } = storedRace;
		const targetHorse = activeHorses[selectedHorseIndex];

		if (!targetHorse) {
			return NextResponse.json(
				{ error: "選択された馬が見つかりません。" },
				{ status: 400 },
			);
		}

		// 3. レース結果のシミュレーション
		const rankResult = simulateRaceRankings(activeHorses);
		const odds =
			betType === "win" ? targetHorse.winOdds : targetHorse.placeOdds;

		let isHit = false;
		if (betType === "win") {
			isHit = rankResult[0] === selectedHorseIndex;
		} else {
			isHit = rankResult.slice(0, 3).includes(selectedHorseIndex);
		}

		const payout = isHit ? Math.floor(betAmountNum * odds) : 0;

		// 💡 4. DB処理（トランザクション処理で残高チェック、増減、履歴記録を一括実行）
		let newBalanceString: string;

		const currentAccount = await prisma.economyAccount.findUnique({
			where: { discordId },
			select: { id: true, coins: true },
		});

		if (!currentAccount) {
			return NextResponse.json(
				{ error: "アカウントが見つかりません。" },
				{ status: 404 },
			);
		}

		try {
			const result = await prisma.$transaction(async (tx) => {
				// 4-1. トランザクション内で残高を確認し、更新を実行する
				const latestAccount = await tx.economyAccount.findUnique({
					where: { discordId },
					select: { coins: true },
				});

				if (!latestAccount) {
					throw new Error("ACCOUNT_NOT_FOUND");
				}

				// 4-2. 残高チェック
				if (latestAccount.coins < betAmountNum) {
					throw new Error("INSUFFICIENT_COINS");
				}

				// 4-3. 差額を計算（ハズレなら -betAmountNum、当たりなら +(payout - betAmountNum)）
				const netChange = payout - betAmountNum;

				// 4-4. コイン更新
				const updatedAccount = await tx.economyAccount.update({
					where: { discordId },
					data: {
						coins: {
							increment: netChange,
						},
					},
					select: { coins: true },
				});

				const newBalance = updatedAccount.coins;

				// 4-5. 履歴記録（トランザクション内で同時実行）
				await tx.raceHistory.create({
					data: {
						discordId,
						selectedHorseIndex,
						selectedHorseName: targetHorse.name,
						betType,
						betAmount: BigInt(betAmountNum),
						odds: parseFloat(odds.toFixed(2)),
						isHit,
						payout: BigInt(payout),
						balanceBefore: BigInt(latestAccount.coins),
						balanceAfter: BigInt(newBalance),
						raceResult: JSON.stringify({
							rankings: rankResult,
							horses: activeHorses.map((h) => ({
								id: h.id,
								name: h.name,
								odds: h.winOdds,
							})),
						}),
					},
				});

				return newBalance;
			});

			newBalanceString = result.toString();
		} catch (error: unknown) {
			if (error instanceof Error) {
				if (error.message === "ACCOUNT_NOT_FOUND") {
					return NextResponse.json(
						{ error: "アカウントが見つかりません。" },
						{ status: 404 },
					);
				}
				if (error.message === "INSUFFICIENT_COINS") {
					return NextResponse.json(
						{ error: "コインが足りません。" },
						{ status: 400 },
					);
				}
			}
			throw error;
		}

		await logEconomyEvent({
			discordId,
			accountId: currentAccount.id ?? undefined,
			eventType: "race_bet",
			amount: BigInt(payout - betAmountNum),
			balanceBefore: BigInt(currentAccount.coins),
			balanceAfter: BigInt(newBalanceString),
			description: `${targetHorse.name} へ ${betType} ${betAmountNum} コイン ${isHit ? "当選" : "落選"}`,
			metadata: {
				selectedHorseIndex,
				selectedHorseName: targetHorse.name,
				betType,
				betAmount: betAmountNum,
				odds,
				isHit,
				payout,
				result: rankResult,
			},
		});

		// 5. 処理完了後、二重賭け防止のためメモリから削除
		raceStore.delete(raceId);

		return NextResponse.json({
			success: true,
			activeHorses,
			rankResult,
			isHit,
			payout,
			newBalance: newBalanceString,
		});
	} catch (error: unknown) {
		console.error("Race API Error:", error);

		if (error instanceof Error) {
			if (error.message === "ACCOUNT_NOT_FOUND") {
				return NextResponse.json(
					{ error: "アカウントが見つかりません。" },
					{ status: 404 },
				);
			}
			if (error.message === "INSUFFICIENT_COINS") {
				return NextResponse.json(
					{ error: "コインが足りません。" },
					{ status: 400 },
				);
			}
		}

		return NextResponse.json(
			{ error: "内部サーバーエラーが発生しました。" },
			{ status: 500 },
		);
	} finally {
		// ⏱️ 計測終了時の比較
		const elapsedCpu = process.cpuUsage(startCpu); // { user: マイクロ秒, system: マイクロ秒 }
		const elapsedTimeMs = performance.now() - startTime; // 経過時間（ミリ秒）

		// ユーザーCPU時間 + システムCPU時間（マイクロ秒 → ミリ秒変換）
		const totalCpuTimeMs = (elapsedCpu.user + elapsedCpu.system) / 1000;

		// CPU使用率（%） = (使用したCPU時間 / 実際に過ぎた時間) * 100
		const cpuPercent = ((totalCpuTimeMs / elapsedTimeMs) * 100).toFixed(1);

		console.log(
			`[RACE API PERF] 実行時間: ${elapsedTimeMs.toFixed(1)}ms | CPU使用時間: ${totalCpuTimeMs.toFixed(1)}ms | CPU負荷率: ${cpuPercent}%`,
		);
	}
}
