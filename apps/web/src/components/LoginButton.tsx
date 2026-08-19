"use client";

import { LogIn } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function LoginButton() {
	const onLogin = async () => {
		// callbackURLを明示的に指定し、認証後のリダイレクトを確実に制御
		await authClient.signIn.social({
			provider: "discord",
			callbackURL: "/dashboard",
			// Better Auth 1.0+ では callbackURL は相対パスでも動作するが、
			// 念のため /dashboard への遷移を確実にする
		});
	};

	return (
		<button
			type="button"
			onClick={onLogin}
			className="flex items-center gap-3 px-8 py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#5865F2]/20 hover:shadow-[#5865F2]/40 active:scale-95"
		>
			<LogIn className="w-5 h-5" />
			Discordでログイン
		</button>
	);
}
