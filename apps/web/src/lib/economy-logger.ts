import { prisma } from "@sirius/database";

export type EconomyLogInput = {
	discordId: string;
	accountId?: string | null;
	eventType: string;
	amount: bigint;
	balanceBefore: bigint;
	balanceAfter: bigint;
	description?: string | null;
	metadata?: Record<string, unknown> | null;
};

export async function logEconomyEvent(input: EconomyLogInput) {
	try {
		if (input.amount === 0n && !input.description) {
			return null;
		}

		return await prisma.economyLog.create({
			data: {
				discordId: input.discordId,
				accountId: input.accountId ?? null,
				eventType: input.eventType,
				amount: input.amount,
				balanceBefore: input.balanceBefore,
				balanceAfter: input.balanceAfter,
				description: input.description ?? null,
				metadata: input.metadata ? JSON.stringify(input.metadata) : null,
			},
		});
	} catch (error) {
		console.error("[logEconomyEvent Error]", error);
		return null;
	}
}
