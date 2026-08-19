import {
	Avatar,
	Box,
	Card,
	CardContent,
	Chip,
	Container,
	Grid,
	Typography,
} from "@mui/material";
import { prisma } from "@sirius/database"; // ← Prismaクライアントのインポート（パスは環境に合わせて調整してください）
import { redirect } from "next/navigation";
import { getSessionWithToken } from "@/lib/auth";

export default async function DashboardUserPage() {
	const session = await getSessionWithToken();

	if (!session?.user) {
		redirect("/login");
	}

	// Better Authの内部ユーザーIDを使って、Discordの連携アカウント情報を取得
	const account = await prisma.account.findFirst({
		where: {
			userId: session.user.id,
			providerId: "discord",
		},
	});

	// DiscordのSnowflake ID（accountId）を取得
	const discordId = account?.accountId;

	const user = session.user as {
		id?: string;
		name?: string;
		email?: string;
		image?: string;
	};

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Typography variant="h4" sx={{ mb: 4, fontWeight: 800 }}>
				マイページ
			</Typography>

			<Grid container spacing={3}>
				<Grid size={{ xs: 12, md: 4 }}>
					<Card>
						<CardContent
							sx={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: 2,
							}}
						>
							<Avatar
								src={user.image ?? undefined}
								sx={{ width: 96, height: 96 }}
							/>

							<Typography variant="h6" sx={{ fontWeight: 700 }}>
								{user.name}
							</Typography>

							{user.email && (
								<Typography variant="body2" color="text.secondary">
									{user.email}
								</Typography>
							)}

							<Chip color="success" label="ログイン中" />
						</CardContent>
					</Card>
				</Grid>

				{/* 右側カード（アカウント詳細情報） */}
				<Grid size={{ xs: 12, md: 8 }}>
					<Card>
						<CardContent>
							<Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
								アカウント情報
							</Typography>

							{/* 従来の内部ID表示の代わりにDiscordのSnowflake IDを表示 */}
							<Box sx={{ mt: 2 }}>
								<Typography variant="body2" color="text.secondary">
									Discord ユーザーID (Snowflake)
								</Typography>

								<Typography sx={{ fontFamily: "monospace" }}>
									{discordId ?? "未連携"}
								</Typography>
							</Box>

							<Box sx={{ mt: 3 }}>
								<Typography variant="body2" color="text.secondary">
									ユーザー名
								</Typography>

								<Typography>{user.name}</Typography>
							</Box>

							<Box sx={{ mt: 3 }}>
								<Typography variant="body2" color="text.secondary">
									メールアドレス
								</Typography>

								<Typography>{user.email ?? "未設定"}</Typography>
							</Box>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Container>
	);
}
