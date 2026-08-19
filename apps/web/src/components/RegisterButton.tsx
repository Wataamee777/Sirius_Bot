"use client";

import { authClient } from "@/lib/auth-client";

export default function RegisterButton() {
	const onRegister = async () => {
		await authClient.signIn.social({
			provider: "discord",
			callbackURL: "/how-to-use",
		});
	};

	return (
		<button type="button" onClick={onRegister}>
			Discordで経済アカウント登録
		</button>
	);
}
