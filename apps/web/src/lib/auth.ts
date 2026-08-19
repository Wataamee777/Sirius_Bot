/** biome-ignore-all lint/style/noNonNullAssertion: 起動時に設定されているものとみなして黙認する */

import { prisma } from "@sirius/database";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { headers } from "next/headers";
import { BASE_URL } from "./constants";

export const auth = betterAuth({
	appName: "SiriusBot",
	baseURL: process.env.BETTER_AUTH_URL || BASE_URL,
	database: prismaAdapter(prisma, {
		provider: "mysql",
	}),
	secret: process.env.BETTER_AUTH_SECRET!,

	// 🛠️ ipAddress は advanced の中に配置する必要があります
	advanced: {
		ipAddress: {
			ipAddressHeaders: ["x-forwarded-for", "cf-connecting-ip"],
		},
	},

	socialProviders: {
		discord: {
			clientId: process.env.DISCORD_CLIENT_ID!,
			clientSecret: process.env.DISCORD_CLIENT_SECRET!,
			scope: ["guilds"],
		},
	},
	// クッキーの設定
	cookie: {
		namePrefix: "siriusbot",
		attributes: {
			secure: true,
			sameSite: "lax",
		},
	},
});

/**
 * サーバーコンポーネント用：セッションとアクセストークンを取得する
 */
export const getSessionWithToken = async () => {
	const h = await headers();

	// 💡 読み取り専用のheadersを安全に複製する
	const clonedHeaders = new Headers(h);

	const clientIp = h.get("x-forwarded-for") || h.get("cf-connecting-ip");
	if (clientIp) {
		clonedHeaders.set("x-forwarded-for", clientIp);
	}

	const session = await auth.api.getSession({
		headers: clonedHeaders, // 複製したヘッダーを渡す
	});

	if (!session?.user) return null;

	const account = await prisma.account.findFirst({
		where: {
			userId: session.user.id,
			providerId: "discord",
		},
	});

	return {
		...session,
		accessToken: account?.accessToken || null,
	};
};

export const getSession = async () => {
	const h = await headers();

	// 💡 同様に安全に複製
	const clonedHeaders = new Headers(h);

	const clientIp = h.get("x-forwarded-for") || h.get("cf-connecting-ip");
	if (clientIp) {
		clonedHeaders.set("x-forwarded-for", clientIp);
	}

	return await auth.api.getSession({
		headers: clonedHeaders,
	});
};
