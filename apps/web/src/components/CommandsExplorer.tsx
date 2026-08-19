"use client";

import { useMemo, useState } from "react";

export type CommandCategory = {
	title: string;
	commands: { name: string; desc: string }[];
};

export default function CommandsExplorer({
	categories = [],
}: {
	categories?: CommandCategory[];
}) {
	const [query, setQuery] = useState("");

	const filtered = useMemo(() => {
		// 1. categories が undefined や null の場合の防御
		const safeCategories = Array.isArray(categories) ? categories : [];

		const keyword = query.trim().toLowerCase();
		if (!keyword) return safeCategories;

		return safeCategories
			.map((category) => ({
				...category,
				// 2. category.commands が存在することを確認
				commands: (category.commands || []).filter(
					(cmd) =>
						cmd?.name?.toLowerCase().includes(keyword) ||
						cmd?.desc?.toLowerCase().includes(keyword),
				),
			}))
			.filter((category) => category.commands.length > 0);
	}, [categories, query]);

	return (
		<div className="commands-container">
			<div className="commands-toolbar">
				<label htmlFor="command-search">コマンド検索</label>
				<input
					id="command-search"
					type="search"
					placeholder="例: ping / ai"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
				/>
			</div>

			{/* 3. filtered の存在チェック */}
			{(!filtered || filtered.length === 0) && (
				<p className="commands-empty">一致するコマンドがありません。</p>
			)}

			{filtered?.map((category) => (
				<section className="command-section" key={category.title}>
					<h2 className="category-title">{category.title?.toUpperCase()}</h2>

					<div className="command-list">
						{category.commands?.map((cmd) => (
							<div className="command-card" key={cmd.name}>
								<div className="command-name">/{cmd.name}</div>
								<div className="command-desc">{cmd.desc}</div>
							</div>
						))}
					</div>
				</section>
			))}
		</div>
	);
}
