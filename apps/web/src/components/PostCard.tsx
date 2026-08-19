import escapeHTML from "escape-html";
import Link from "next/link";

type PostCardProps = {
	dirname: string;
	slug: string;
	title: string;
	date: string;
	description: string;
};

const PostCard = ({
	dirname,
	slug,
	title,
	date,
	description,
}: PostCardProps) => {
	return (
		<div
			className="about-card flex flex-col items-start gap-2 hover-lift h-full"
			key={slug}
		>
			<div className="flex flex-col mb-2 w-full">
				{/* 既存のCSSクラス .about-badge を使用 */}
				<span className="about-badge w-fit">{date}</span>

				{/* タイトル： line-clampで2行に制限 */}
				<h2 className="text-xl font-bold mt-3 mb-2 line-clamp-2 leading-snug text-white">
					{title}
				</h2>

				{/* 説明文：テキストをグレーにしてコントラストを調整 */}
				<p className="text-gray-400 text-sm line-clamp-2 flex-grow mb-4">
					{description}
				</p>
			</div>

			<Link
				href={`/${escapeHTML(dirname)}/${escapeHTML(slug)}`}
				className="inline-flex items-center text-blue-400 hover:text-blue-300 font-bold transition-colors mt-auto"
			>
				続きを読む
				<svg
					width="16"
					height="16"
					viewBox="0 0 20 20"
					fill="currentColor"
					className="ml-1"
				>
					<title>detail</title>
					<path
						fillRule="evenodd"
						d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
						clipRule="evenodd"
					/>
				</svg>
			</Link>
		</div>
	);
};

export default PostCard;
