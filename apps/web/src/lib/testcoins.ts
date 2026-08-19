"use server";

import { prisma } from "@sirius/database";
import { logEconomyEvent } from "@/lib/economy-logger";

/**
 * 🧪 テスト用: 指定した額のコインを加算する Server Action
 */
export async function addTestCoins(discordId: string, amount: number = 1000) {
	try {
		const currentAccount = await prisma.economyAccount.findUnique({
			where: { discordId },
			select: { id: true, coins: true },
		});

		if (!currentAccount) {
			return { success: false, error: "アカウントが見つかりません。" };
		}

		const updated = await prisma.economyAccount.update({
			where: { discordId },
			data: {
				coins: {
					increment: amount,
				},
			},
			select: { id: true, coins: true },
		});

		await logEconomyEvent({
			discordId,
			accountId: updated.id,
			eventType: "test_coin",
			amount: BigInt(amount),
			balanceBefore: BigInt(currentAccount.coins),
			balanceAfter: BigInt(updated.coins),
			description: "テスト用コイン付与",
			metadata: { amount },
		});

		return { success: true, coins: updated.coins };
	} catch (error) {
		console.error("コイン加算エラー:", error);
		return { success: false, error: "コインの加算に失敗しました。" };
	}
}
