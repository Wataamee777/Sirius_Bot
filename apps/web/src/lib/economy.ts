import { prisma } from "@sirius/database";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getDiscordAccountForSession() {
	const requestHeaders = await headers();
	const session = await auth.api.getSession({
		headers: Object.fromEntries(requestHeaders.entries()),
	});

	if (!session?.user) return null;

	const account = await prisma.account.findFirst({
		where: {
			userId: session.user.id,
			providerId: "discord",
		},
	});

	if (!account?.accountId) return null;

	return {
		session,
		discordId: account.accountId,
		user: session.user,
	};
}

export async function getEconomyAccountByDiscordId(discordId: string) {
	return prisma.economyAccount.findUnique({
		where: { discordId },
	});
}
