import { prisma } from "@sirius/database";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

interface DiscordGuild {
	id: string;
	name: string;
	icon: string;
	owner: boolean;
	permissions: string;
	features: string[];
}

export async function checkAdminPermission(guildId: string): Promise<boolean> {
	// 1. セッションの取得
	const currentHeaders = await headers();
	const session = await auth.api.getSession({ headers: currentHeaders });
	if (!session?.user) return false;

	// 2. DBからアクセストークンを取得
	const account = await prisma.account.findFirst({
		where: {
			userId: session.user.id,
			providerId: "discord",
		},
	});

	const accessToken = account?.accessToken;
	if (!accessToken) {
		console.error("Discord access token not found in DB");
		return false;
	}

	// 3. Discord APIからサーバー一覧を取得
	try {
		const userRes = await fetch(
			"https://discord.com/api/v10/users/@me/guilds",
			{
				headers: { Authorization: `Bearer ${accessToken}` },
				cache: "no-store",
			},
		);

		if (!userRes.ok) {
			console.error(
				`Discord API error: ${userRes.status} ${userRes.statusText}`,
			);
			return false;
		}

		// 💡 一度テキストとして取得してガードする
		const text = await userRes.text();
		if (!text || text.trim() === "") {
			console.error("[checkAdminPermission] Empty response from Discord API");
			return false;
		}

		let userGuilds: DiscordGuild[];
		try {
			userGuilds = JSON.parse(text) as DiscordGuild[];
		} catch (_parseError) {
			console.error(
				"[checkAdminPermission] JSON parse error for Discord response:",
				text,
			);
			return false;
		}

		// 4. 対象のギルドを探し、権限を検証
		if (!Array.isArray(userGuilds)) {
			console.error(
				"[checkAdminPermission] Expected array but received:",
				userGuilds,
			);
			return false;
		}

		const targetGuild = userGuilds.find((g) => g.id === guildId);
		if (!targetGuild) return false;

		const ADMINISTRATOR_BIT = BigInt(0x8);
		const perms = BigInt(targetGuild.permissions);
		const isAdmin =
			(perms & ADMINISTRATOR_BIT) === ADMINISTRATOR_BIT || targetGuild.owner;

		return isAdmin;
	} catch (error) {
		console.error("Permission check error:", error);
		return false;
	}
}
