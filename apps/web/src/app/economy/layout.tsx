import type React from "react";
import Header from "@/components/economy/Header";
import { getDiscordAccountForSession } from "@/lib/economy";

const ECONOMY_ADMIN_DISCORD_ID = "1275233053601435703";

export default async function EconomyLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const authData = await getDiscordAccountForSession();
	const isAdmin = authData?.discordId === ECONOMY_ADMIN_DISCORD_ID;

	return <Header isAdmin={isAdmin}>{children}</Header>;
}
