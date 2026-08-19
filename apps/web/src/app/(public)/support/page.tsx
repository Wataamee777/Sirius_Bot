import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "support ",
	description: "サポートサーバーリンクページ",
	openGraph: {
		type: "article",
	},
};

export default function SupportPage() {
	return (
		<>
			<p>サポートサーバーはこちら↓</p>
			<a href="https://discord.gg/qWzcJkJky2" target="_blank" rel="noreferrer">
				<button type="button">
					<span className="material-symbols-outlined">open_in_new</span>{" "}
					サポートサーバー(Discord)
				</button>
			</a>
		</>
	);
}
