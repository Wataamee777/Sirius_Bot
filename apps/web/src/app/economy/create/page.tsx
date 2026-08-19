import { redirect } from "next/navigation";
import EconomyCreateForm from "@/components/economy/EconomyCreateForm";
import {
	getDiscordAccountForSession,
	getEconomyAccountByDiscordId,
} from "@/lib/economy";

export default async function EconomyCreatePage() {
	const authData = await getDiscordAccountForSession();
	if (!authData) {
		redirect("/login");
	}

	const existing = await getEconomyAccountByDiscordId(authData.discordId);
	if (existing) {
		redirect("/economy");
	}

	return <EconomyCreateForm />;
}
