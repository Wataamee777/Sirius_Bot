"use server";

import { prisma } from "@sirius/database";
import { logEconomyEvent } from "@/lib/economy-logger";

/**
 * 🎰 ジャグラーの処理 (Server Action)
 * @param discordId ユーザーID
 * @param coinsSpent 消費コイン (30コイン = メダル3枚)
 * @param bonusType "BB" | "RB" | null
 */
export async function processJugglerGame(
	discordId: string,
	coinsSpent: number,
	bonusType: "BB" | "RB" | null,
) {
	try {
		let payoutCoins = 0;
		if (bonusType === "BB") payoutCoins = 3000; // BB: 300枚相当 (3000コイン)
		if (bonusType === "RB") payoutCoins = 1000; // RB: 100枚相当 (1000コイン)

		const netChange = payoutCoins - coinsSpent;

		const currentAccount = await prisma.economyAccount.findUnique({
			where: { discordId },
			select: { id: true, coins: true },
		});

		if (!currentAccount) {
			return { success: false, error: "アカウントが見つかりません。" };
		}

		const updatedAccount = await prisma.economyAccount.update({
			where: { discordId },
			data: {
				coins: { increment: netChange },
			},
			select: { id: true, coins: true },
		});

		await logEconomyEvent({
			discordId,
			accountId: updatedAccount.id,
			eventType: "juggler",
			amount: BigInt(netChange),
			balanceBefore: BigInt(currentAccount.coins),
			balanceAfter: BigInt(updatedAccount.coins),
			description: `ジャグラー結果: ${bonusType ?? "通常"}`,
			metadata: {
				bonusType,
				coinsSpent,
				payoutCoins,
			},
		});

		return {
			success: true,
			newBalance: Number(updatedAccount.coins),
			payout: payoutCoins,
		};
	} catch (error) {
		console.error("ジャグラー処理エラー:", error);
		return { success: false, error: "処理に失敗しました。" };
	}
}
