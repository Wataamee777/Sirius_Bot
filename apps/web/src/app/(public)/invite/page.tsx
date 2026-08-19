"use client";

import { useEffect } from "react";

/**
 * 構成設定
 */
const CLIENT_ID = "1444640844467404962";
const INVITE_LINKS = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=bot+applications.commands`;

export default function InvitePage() {
	/**
	 * 隠し機能: コンソールから招待リンク生成
	 */
	useEffect(() => {
		window.invite = (permissions: number | string = 0) => {
			const url = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&permissions=${permissions}&scope=bot%20applications.commands&integration_type=0,1`;
			console.log(
				"%c🌌 SiriusBot Invite Generator",
				"color: #6366f1; font-size: 1.2rem; font-weight: bold; padding: 4px;",
			);
			console.log(`URL: ${url}`);
			if (navigator.clipboard) {
				navigator.clipboard.writeText(url);
				return "✅ クリップボードにコピーしました。";
			}
			return "✅ コンソールにURLを出力しました。";
		};
		return () => {
			delete window.invite;
		};
	}, []);

	return (
		<div className="invite-container">
			<h2>Invite SiriusBot</h2>

			<button
				onClick={() => window.open(INVITE_LINKS, "_blank")}
				style={{ display: "flex", alignItems: "center", gap: "8px" }}
				type="button"
			>
				<span className="material-symbols-outlined">link</span>
				Discordで追加
			</button>
		</div>
	);
}
