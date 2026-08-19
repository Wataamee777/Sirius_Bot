import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "privacy ",
	description: "プライバリシーポリシーページ",
	openGraph: {
		type: "article",
	},
};

export default function PrivacyPage() {
	return (
		<section id="privacy">
			<h1>プライバリシーポリシー</h1>
			<p>coming soon</p>
			<small>2026 SiriusBot</small>
		</section>
	);
}
