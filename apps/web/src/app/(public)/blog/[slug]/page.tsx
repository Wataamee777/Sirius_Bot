import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PostList from "@/components/RecentPostList";
import { getLastModifiedDate } from "@/lib/git";
import { getAllPosts, getPostBySlug, getRecentPosts } from "@/lib/posts";

export const dynamic = "force-static";
export const dynamicParams = true;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/button";

type PostPageProps = { params: Promise<{ slug: string }> };

// Commands ページと同じく title と description だけのシンプルな形式
export async function generateMetadata({
	params,
}: PostPageProps): Promise<Metadata> {
	const { slug } = await params;
	const post = await getPostBySlug(slug);

	if (!post) {
		return {
			title: "Blog ",
			description: "SiriusBotのブログ",
		};
	}

	return {
		title: `${post.title} - SiriusBot`,
		description: "SiriusBotのブログ",
	};
}

export async function generateStaticParams() {
	const posts = await getAllPosts();
	return posts.map((post) => ({
		slug: post.slug,
	}));
}

export default async function PostPage({ params }: PostPageProps) {
	const { slug } = await params;
	const post = await getPostBySlug(slug);

	if (!post) {
		notFound();
	}

	const lastModified =
		getLastModifiedDate(`posts/${slug}.md`) || new Date(post.date);
	const recentPosts = await getRecentPosts(8);

	return (
		<main className="min-h-screen w-full bg-linear-to-br from-slate-50 via-white to-slate-50">
			{/* ヘッダーセクション */}
			<section className="w-full pt-28 pb-16 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
				<div className="max-w-4xl mx-auto px-6">
					<div className="text-center space-y-4">
						<h1 className="text-3xl lg:text-4xl font-bold font-sansen tracking-wide text-white animate-slideUp">
							{post.title}
						</h1>
						<div className="flex flex-col items-center gap-2 text-white/80 font-sansjp tracking-wider animate-fadeInUp animation-delay-300">
							<p className="flex items-center gap-2">
								投稿日: {new Date(post.date).toLocaleDateString("ja-JP")}
							</p>
							<p className="flex items-center gap-2">
								最終更新: {lastModified.toLocaleDateString("ja-JP")}
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* 記事本文 */}
			<article className="max-w-4xl mx-auto px-6 py-12">
				<div className="bg-white/80 backdrop-blur-xs rounded-2xl shadow-lg p-8 animate-fadeIn">
					<div className="prose-lg prose-slate w-full max-w-none">
						<div className="markdown">
							<ReactMarkdown remarkPlugins={[remarkGfm]}>
								{post.content}
							</ReactMarkdown>
						</div>
					</div>
				</div>
			</article>

			{/* 最近のアナウンス */}
			<section className="w-full py-16 bg-linear-to-br from-slate-50/50 via-white to-slate-50/50">
				<div className="max-w-4xl mx-auto px-6">
					<h2 className="text-2xl font-bold font-sansen mb-8 text-center animate-fadeInUp">
						最近のブログ
					</h2>
					<PostList
						posts={recentPosts}
						dirname="blog"
						className="bg-white/80 backdrop-blur-xs rounded-2xl shadow-lg overflow-hidden animate-fadeInUp animation-delay-300"
					/>
					<div className="text-center mt-8 animate-fadeInUp animation-delay-500">
						<Button
							href="/blog"
							className="border border-slate-200 bg-white hover:bg-slate-50 hover:scale-105 transition-all shadow-sm"
						>
							一覧を見る
						</Button>
					</div>
				</div>
			</section>
		</main>
	);
}
