import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

/**
 * 型定義・設定などはそのまま...
 */
type StaffMember = {
	id: string;
	name: string;
	roleName: string;
	roleClass: string;
	icon: string;
};
type DiscordMember = {
	user: {
		id: string;
		username: string;
		global_name?: string | null;
		avatar?: string | null;
	};
	nick?: string | null;
	roles?: string[];
};

export const metadata: Metadata = {
	title: "About ",
	description: "SiriusBotの特徴と運営情報",
};

const TARGET_GUILD_ID = "1444644623262814251";
const ROLE_PRIORITY = [
	{ id: "1484904849371041903", name: "サーバー主", class: "role-owner" },
	{ id: "1444671639970119802", name: "管理者", class: "role-admin" },
	{ id: "1475068755339120650", name: "モデレーター", class: "role-moderater" },
	{ id: "1469292279062593556", name: "サポーター", class: "role-supporter" },
] as const;

async function getStaffData(): Promise<StaffMember[]> {
	const token = process.env.DISCORD_BOT_TOKEN;
	if (!token) return [];

	try {
		const res = await fetch(
			`https://discord.com/api/v10/guilds/${TARGET_GUILD_ID}/members?limit=1000`,
			{
				headers: { Authorization: `Bot ${token}` },
				cache: "no-store",
			},
		);
		if (!res.ok) return [];
		const members: DiscordMember[] = await res.json();
		const targetRoleSet = new Set<string>(ROLE_PRIORITY.map((r) => r.id));

		return members
			.filter((m) => m.roles?.some((rId) => targetRoleSet.has(rId)))
			.map((m) => {
				const roles = m.roles || [];
				const topRole = ROLE_PRIORITY.find((p) => roles.includes(p.id));
				const userId = m.user.id;
				const avatarHash = m.user.avatar;
				const iconUrl = avatarHash
					? `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png`
					: `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(userId) >> 22n) % 6}.png`;

				return {
					id: userId,
					name: m.nick || m.user.global_name || m.user.username,
					roleName: topRole?.name || "スタッフ",
					roleClass: topRole?.class || "",
					icon: iconUrl,
				};
			})
			.sort((a, b) => {
				const idxA = ROLE_PRIORITY.findIndex((r) => r.name === a.roleName);
				const idxB = ROLE_PRIORITY.findIndex((r) => r.name === b.roleName);
				return idxA - idxB;
			});
	} catch {
		return [];
	}
}

export default async function AboutPage() {
	const staffMembers = await getStaffData();

	return (
		<div className="about-page animation">
			{/* 💡 コメントは必ず親要素(div)の内側に配置します */}
			{/* ヒーローセクション */}
			<section className="about-hero">
				<p className="about-badge">About SiriusBot</p>
				<h1 className="about-title">SiriusBot について</h1>
				<p className="about-lead">
					SiriusBot
					は、Discordコミュニティの運営を「楽しく・安全に・効率よく」することを目指すマルチ機能Botです。
				</p>
				<div className="about-actions">
					<Link href="/commands" className="about-link-btn">
						コマンドを見る
					</Link>
					<Link href="/invite" className="about-link-btn secondary">
						招待する
					</Link>
				</div>
			</section>

			{/* 運営メンバーセクション */}
			<section className="about-section">
				<h2 className="category-title">運営メンバー</h2>
				<div className="staff-container">
					{staffMembers.length > 0 ? (
						staffMembers.map((member) => (
							<div key={member.id} className="staff-card">
								<Image
									src={member.icon}
									alt={member.name}
									className="staff-icon"
									width={64}
									height={64}
								/>
								<div className="staff-info">
									<h3 className="staff-name">{member.name}</h3>
									<span className={`role-tag ${member.roleClass}`}>
										{member.roleName}
									</span>
								</div>
							</div>
						))
					) : (
						<div className="error-fallback">
							<p>
								メンバー情報を取得できませんでした。時間をおいて再度お試しください。
							</p>
						</div>
					)}
				</div>
			</section>
		</div>
	);
}
