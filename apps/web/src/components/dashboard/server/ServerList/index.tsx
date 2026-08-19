"use server";

import { Add, Shield } from "@mui/icons-material";

import { Alert, Button, Card, Typography } from "@mui/material";
import { headers as fetchHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import { BACKEND_URL } from "@/lib/constants";
import Client, { type Guild } from "./Client";

const fetchServerList = async (): Promise<{
	guilds: Guild[];
	error?: string | undefined;
}> => {
	try {
		const headers = await fetchHeaders();
		const accounts = await auth.api.listUserAccounts({
			headers,
		});
		const discordAccount = accounts.find(
			(account) => account.providerId === "discord",
		);
		if (!discordAccount)
			return { guilds: [], error: "Discord再ログインが必要です" };
		const tokenRes = await auth.api.getAccessToken({
			headers,
			body: {
				accountId: discordAccount.id,
			},
		});

		const accessToken = tokenRes.accessToken;

		const botRes = await fetch(`${BACKEND_URL}/api/guilds`);
		const botGuildIds: string[] = await botRes.json();

		const userRes = await fetch(
			"https://discord.com/api/v10/users/@me/guilds",
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			},
		);

		const guilds = await userRes.json();

		const ADMINISTRATOR = BigInt(0x8);

		const filtered = guilds
			.filter((g: unknown) => {
				const guild = g as {
					permissions: string;
					owner: boolean;
					id: string;
				};
				const perms = BigInt(guild.permissions);

				return (
					((perms & ADMINISTRATOR) === ADMINISTRATOR || guild.owner) &&
					botGuildIds.includes(guild.id)
				);
			})
			.map((g: unknown) => {
				const guild = g as {
					id: string;
					name: string;
					icon: string | null;
					owner: boolean;
				};
				return {
					id: guild.id,
					name: guild.name,
					icon: guild.icon,
					owner: guild.owner,
				};
			});

		return { guilds: filtered };
	} catch {
		return { guilds: [], error: "サーバーエラーが発生しました。" };
	}
};

export default async function ServerList() {
	const { guilds, error } = await fetchServerList();

	if (error) {
		return <Alert severity="error">{error}</Alert>;
	}

	if (!guilds.length) {
		return (
			<Card
				sx={{
					p: 4,
					textAlign: "center",
					backdropFilter: "blur(12px)",
					background: "rgba(255,255,255,.03)",
				}}
			>
				<Shield
					sx={{
						fontSize: 50,
						mb: 2,
					}}
				/>

				<Typography variant="h6" sx={{ color: "rgba(255,255,255,0.85)" }}>
					管理可能なサーバーがありません
				</Typography>

				<Button
					sx={{ mt: 3, color: "rgba(255,255,255,0.85)" }}
					startIcon={<Add />}
					variant="contained"
					href="/invite"
				>
					Botを招待
				</Button>
			</Card>
		);
	}

	return <Client guilds={guilds} />;
}
