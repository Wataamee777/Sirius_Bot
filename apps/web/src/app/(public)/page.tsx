import Link from "next/link";

export default function HomePage() {
	return (
		<section className="home-hero">
			<p className="home-badge">SiriusBot Official</p>
			<h1>コミュニティ運営を、もっとスマートに。</h1>
			<p className="home-lead">
				SiriusBot
				は、管理・経済・コミュニティ機能を1つにまとめたDiscord向けマルチ機能Botです。
			</p>

			<div className="home-actions">
				<Link href="/commands" className="home-link-btn">
					コマンドを確認
				</Link>
				<Link href="/about" className="home-link-btn secondary">
					詳細を見る
				</Link>
			</div>
		</section>
	);
}
