import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getUserById } from "@/lib/user";

export default async function dashboardIndex() {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session?.user) {
		return (
			<section className="profile-page">
				<div className="page-header">
					<h1>マイページ</h1>
					<p>
						Discord連携で Sirius
						アカウントを登録すると、プロフィールやサーバー管理を行えます。
					</p>
				</div>
				<div className="profile-card">
					<p>まずは Discord でログインしてください。</p>
					<div className="profile-actions">
						<Link href="/register">Discordで登録・ログイン</Link>
					</div>
				</div>
			</section>
		);
	}

	const user = await getUserById(session.user.id);
	if (!user) {
		return (
			<section className="profile-page">
				<div className="page-header">
					<h1>マイページ</h1>
					<p>ユーザー情報を取得できませんでした。</p>
				</div>
				<div className="profile-actions">
					<Link href="/register">再登録する</Link>
				</div>
			</section>
		);
	}

	const discordAccount = user.accounts.find(
		(account: { providerId: string }) => account.providerId === "discord",
	);
	const displayName = user.name || "未設定のユーザー";

	return (
		<section className="profile-page">
			<div className="page-header">
				<h1>{displayName} さんのマイページ</h1>
				<p>
					このアカウントで Discord 連携済みの SiriusBot 管理機能を利用できます。
				</p>
			</div>
			<div className="profile-card">
				{user.image && (
					<Image
						src={user.image}
						alt={displayName}
						className="profile-avatar"
						width={96}
						height={96}
					/>
				)}
				<p>
					<strong>表示名:</strong> {displayName}
				</p>
				<p>
					<strong>メール:</strong> 未登録
				</p>
				<p>
					<strong>Discord連携:</strong> {discordAccount ? "連携済み" : "未連携"}
				</p>
				<div className="profile-actions">
					<Link href="/dashboard/edit">プロフィール編集</Link>
				</div>
			</div>
		</section>
	);
}
