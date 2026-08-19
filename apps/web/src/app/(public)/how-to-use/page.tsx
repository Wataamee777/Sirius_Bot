import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "how-to-use ",
	description: "使い方ページ",
	openGraph: {
		type: "article",
	},
};

export default function HowToUsePage() {
	return (
		<section id="how-to-use">
			<h1>使い方</h1>
			<p>coming soon</p>
			<small>2026 SiriusBot</small>
		</section>
	);
}
