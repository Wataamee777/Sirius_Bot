import { Box, CircularProgress } from "@mui/material";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import ServerHero from "@/components/dashboard/server/ServerHero";
import ServerList from "@/components/dashboard/server/ServerList";
import { auth } from "@/lib/auth";

export default async function ServerPage() {
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
			<ServerHero />

			<Box sx={{ mt: 4 }}>
				<Suspense
					fallback={
						<Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
							<CircularProgress />
						</Box>
					}
				>
					<ServerList />
				</Suspense>
			</Box>
		</main>
	);
}
