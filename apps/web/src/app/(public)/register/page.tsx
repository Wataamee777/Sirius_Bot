import type { Metadata } from "next";
import RegisterButton from "@/components/RegisterButton";

export const metadata: Metadata = {
	title: "Register ",
	description: "ユーザー登録ページ",
	openGraph: {
		type: "article",
	},
};

export default function RegisterPage() {
	return (
		<section id="register">
			<h1>経済アカウント登録</h1>
			<p>Discord OAuth2 で経済アカウントを登録します。</p>
			<RegisterButton />
			<small>2026 SiriusBot</small>
		</section>
	);
}
