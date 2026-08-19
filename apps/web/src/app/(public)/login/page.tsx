import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginClient from "@/components/LoginClient";
import { getSessionWithToken } from "@/lib/auth";

export const metadata: Metadata = {
	title: "Login ",
	description: "SiriusBotの管理パネルへのログイン",
};

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ ignoreredir?: string }>;
}) {
	const session = await getSessionWithToken();
	const params = await searchParams;

	const ignoreRedirect = "ignoreredir" in params;

	if (session?.user && !ignoreRedirect) {
		redirect("/dashboard");
	}

	return <LoginClient />;
}
