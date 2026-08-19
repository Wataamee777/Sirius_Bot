import type { Metadata } from "next";
// コンポーネントや取得関数は既存の UniProject のものをそのまま import
import PostList from "@/components/PostList";
import { getAllPosts } from "@/lib/posts";

export const dynamic = "force-static";

export const metadata: Metadata = {
	title: "Blogs ",
	description: "使い方や各種イベントなどの情報をお届けします。",
};

// コンポーネントを async にして、中身を UniProject のロジックそのままにする
export default async function BlogsPage() {
	// getPosts (または getAllPosts) をそのまま実行
	// もし非同期関数なら await をつける
	const posts = getAllPosts().sort(
		(a, b) => b.date.getTime() - a.date.getTime(),
	);

	return (
		<main className="flex min-h-screen flex-col items-center bg-linear-to-br from-slate-50 via-white to-slate-50">
			{/* ヘッダーセクション（UniProjectのスタイルを継承） */}
			<section className="w-full pt-24 pb-12 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
				<div className="max-w-7xl mx-auto px-4 text-center">
					<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white animate-slideUp">
						ブログ一覧
					</h1>
					{/*文自由に変えていいよ*/}
					<p className="mt-4 text-white/80 animate-fadeInUp animation-delay-300">
						最新のブログをお届けします
					</p>
				</div>
			</section>

			{/* コンテンツセクション */}
			<section className="w-full py-12">
				<div className="max-w-5xl mx-auto px-4">
					{/* PostList コンポーネントもそのまま使う */}
					<PostList
						dirname="blog"
						posts={posts}
						className="w-full bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow"
						listClassName="grid-cols-1! md:grid-cols-2!"
					/>
				</div>
			</section>
		</main>
	);
}
