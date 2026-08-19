import { Alert, Box } from "@mui/material";
import HorseRace from "@/components/economy/HorseRace";
import {
	getDiscordAccountForSession,
	getEconomyAccountByDiscordId,
} from "@/lib/economy";

// キャッシュを無効化し、常に最新のセッションと残高を取得する
export const dynamic = "force-dynamic";

export default async function RacePage() {
	const accountData = await getDiscordAccountForSession();

	// Discord未ログイン時のエラー表示
	if (!accountData) {
		return (
			<Box sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
				<Alert severity="warning">
					Discord連携アカウントが見つかりません。ログインしてください。
				</Alert>
			</Box>
		);
	}

	const economy = await getEconomyAccountByDiscordId(accountData.discordId);

	// エコノミーデータが存在しない場合のハンドリング
	if (!economy) {
		return (
			<Box sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
				<Alert severity="error">
					エコノミーアカウントデータが見つかりません。初期登録を行ってください。
				</Alert>
			</Box>
		);
	}

	// 残高とDiscord IDの抽出
	const balance = Number(economy.coins ?? 0);
	const discordId = String(accountData.discordId);

	return <HorseRace initialBalance={balance} discordId={discordId} />;
}
