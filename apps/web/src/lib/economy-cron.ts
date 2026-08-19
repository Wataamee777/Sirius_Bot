import { prisma } from "@sirius/database";
import { BIRTHDAY_BONUS_COINS } from "@/lib/economy-constants";
import { logEconomyEvent } from "@/lib/economy-logger";
import { clampStat } from "@/lib/economyStats";

const SATIATION_DECAY = 3;
const HAPPINESS_DECAY = 5;
const TREATMENT_COST = 3000n;

export type PeriodicProcessResult = {
	processedAccounts: number;
	birthdayBonuses: number;
	decayedAccounts: number;
};

export async function runPeriodicEconomyProcessing(): Promise<PeriodicProcessResult> {
	const accounts = await prisma.economyAccount.findMany();
	const now = new Date();
	const currentYear = now.getFullYear();
	const currentMonth = now.getMonth() + 1;
	const currentDay = now.getDate();

	let birthdayBonuses = 0;
	let decayedAccounts = 0;

	for (const account of accounts) {
		let coins = account.coins; // number
		let satiation = account.satiation;
		let happiness = account.happiness;
		let lastBirthdayBonusYear = account.lastBirthdayBonusYear;
		let changed = false;

		const balanceBefore = coins;

		if (account.birthday) {
			const bMonth = account.birthday.getUTCMonth() + 1;
			const bDay = account.birthday.getUTCDate();

			if (
				bMonth === currentMonth &&
				bDay === currentDay &&
				lastBirthdayBonusYear !== currentYear
			) {
				coins += BIRTHDAY_BONUS_COINS;
				lastBirthdayBonusYear = currentYear;
				birthdayBonuses += 1;
				changed = true;
			}
		}

		const nextSatiation = clampStat(satiation - SATIATION_DECAY);
		const nextHappiness = clampStat(happiness - HAPPINESS_DECAY);
		let status = account.status;

		// 病気の判定と治療費
		if (status !== "健康") {
			const nextCoins = coins - TREATMENT_COST;
			coins = nextCoins < 0n ? 0n : nextCoins;
			changed = true;
		}

		// 幸福度が10%以下で精神病
		if (nextHappiness <= 10 && status === "健康") {
			status = "精神病";
			const nextCoins = coins - TREATMENT_COST;
			coins = nextCoins < 0n ? 0n : nextCoins;
			changed = true;
		}

		// 満腹度が0で1週間以上続いたら餓死
		if (nextSatiation === 0 && status === "健康") {
			const lastUpdate = account.updatedAt;
			const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			if (lastUpdate < oneWeekAgo) {
				status = "餓死";
				changed = true;
			}
		}

		if (nextSatiation !== satiation || nextHappiness !== happiness) {
			satiation = nextSatiation;
			happiness = nextHappiness;
			decayedAccounts += 1;
			changed = true;
		}

		if (changed) {
			await prisma.economyAccount.update({
				where: { id: account.id },
				data: {
					coins,
					satiation,
					happiness,
					status,
					lastBirthdayBonusYear,
				},
			});

			const actualChange = coins - balanceBefore;
			if (actualChange.toString() !== "0" || status !== account.status) {
				await logEconomyEvent({
					discordId: account.discordId,
					accountId: account.id,
					eventType:
						actualChange > 0
							? "bonus"
							: status !== account.status
								? "status_change"
								: "expense",
					amount: BigInt(actualChange),
					balanceBefore: BigInt(balanceBefore),
					balanceAfter: BigInt(coins),
					description:
						status !== account.status
							? `ステータス更新: ${account.status} → ${status}`
							: `定期処理: ${account.status}`,
					metadata: {
						birthdayBonus: birthdayBonuses,
						satiation: { before: account.satiation, after: satiation },
						happiness: { before: account.happiness, after: happiness },
						status: { before: account.status, after: status },
					},
				});
			}
		}
	}

	return {
		processedAccounts: accounts.length,
		birthdayBonuses,
		decayedAccounts,
	};
}
