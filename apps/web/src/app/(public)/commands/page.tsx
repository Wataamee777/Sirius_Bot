import type { Metadata } from "next";
import CommandsExplorer from "@/components/CommandsExplorer";
import { type ApiCommand, BACKEND_URL } from "@/lib/constants";

export const metadata: Metadata = {
	title: "Commands ",
	description: "SiriusBotの全コマンド一覧",
};

// ... (インポートはそのまま)

export default async function CommandsPage() {
	let apiCommands: ApiCommand[] = [];

	try {
		const res = await fetch(`${BACKEND_URL}/api/commands`, {
			cache: "no-store",
		});
		if (res.ok) {
			apiCommands = await res.json();
		}
	} catch {
		apiCommands = [];
	}

	// データをコンポーネントが期待する「カテゴリー形式」に整形
	const categories = [
		{
			title: "All Commands",
			commands: (Array.isArray(apiCommands) ? apiCommands : []).map((cmd) => ({
				name: cmd?.name ?? "Unknown",
				desc: cmd?.description ?? "",
			})),
		},
	];

	return (
		<>
			<h1 className="site-name">Commands</h1>
			{/* 名前を categories に合わせて渡す */}
			<CommandsExplorer categories={categories} />
		</>
	);
}
