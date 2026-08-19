import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "terms ",
	description: "利用規約ページ",
	openGraph: {
		type: "article",
	},
};

export default function TermsPage() {
	return (
		<section id="terms">
			<h1>利用規約</h1>
			<p>coming soon</p>
			<small>2026 SiriusBot</small>
		</section>
	);
}
