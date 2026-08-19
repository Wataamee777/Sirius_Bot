import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getUserById } from "@/lib/user";

export default async function UserProfilePage({
	params,
}: {
	params: Promise<{ userid: string }>;
}) {
	const { userid } = await params;
	const targetUser = await getUserById(userid);
	const session = await auth.api.getSession({ headers: await headers() });
	const isOwnProfile = session?.user?.id === userid;

	if (!targetUser) {
		return (
			<section className="profile-page">
				<div className="page-header">
					<h1>ユーザー情報</h1>
					<p>このIDは Sirius アカウントに登録されていません。</p>
				</div>
				<div className="profile-card">
					<p>
						<strong>ユーザーID:</strong> {userid}
					</p>
					<p>登録すると /dashboard からプロフィールを管理できます。</p>
					<div className="profile-actions">
						<Link href="/register">Discord連携でSiriusアカウントを登録</Link>
					</div>
				</div>
			</section>
		);
	}

	const discordAccount = targetUser.accounts.find(
		(account: { providerId: string }) => account.providerId === "discord",
	);
	const displayName = targetUser.name || "未設定のユーザー";

	return (
		<section className="profile-page">
			<div className="page-header">
				<h1>{displayName} さんのプロフィール</h1>
				<p>このユーザーの Sirius アカウント情報を表示します。</p>
			</div>
			<div className="profile-card">
				{targetUser.image ? (
					<Image
						src={targetUser.image}
						alt={displayName}
						className="profile-avatar"
						width={96}
						height={96}
					/>
				) : (
					<div className="profile-avatar placeholder">アバター未設定</div>
				)}
				<p>
					<strong>表示名:</strong> {displayName}
				</p>
				<p>
					<strong>メール:</strong> 未登録
				</p>
				<p>
					<strong>登録状態:</strong> Sirius アカウント登録済み
				</p>
				<p>
					<strong>Discord連携:</strong> {discordAccount ? "連携済み" : "未連携"}
				</p>
				{isOwnProfile && (
					<div className="profile-actions">
						<Link href="/dashboard/edit">プロフィールを編集</Link>
					</div>
				)}
			</div>
		</section>
	);
}
