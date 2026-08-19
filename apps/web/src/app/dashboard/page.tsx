import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardGrid from "@/components/dashboard/DashboardGrid";

import DashboardHero from "@/components/dashboard/DashboardHero";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/login");
	}

	return (
		<main
			style={{
				minHeight: "100vh",
				padding: "32px",
				background:
					"radial-gradient(circle at top left, rgba(88,101,242,.15), transparent 30%), radial-gradient(circle at top right, rgba(155,89,182,.12), transparent 40%), #0a0a0c",
			}}
		>
			<DashboardHero user={session.user} />
			<DashboardGrid />
		</main>
	);
}
