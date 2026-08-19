import { Box, Typography } from "@mui/material";

export default function ServerHero() {
	return (
		<Box
			sx={{
				p: 4,
				borderRadius: 4,
				backdropFilter: "blur(12px)",
				background: "rgba(255,255,255,.03)",
				border: "1px solid rgba(255,255,255,.08)",
			}}
		>
			<Typography
				variant="h4"
				sx={{
					fontWeight: "bold",
					color: "rgba(255,255,255,0.85)",
				}}
			>
				サーバー管理
			</Typography>

			<Typography
				sx={{
					mt: 1,
					color: "rgba(255,255,255,0.85)",
				}}
			>
				管理者権限を持ち、SiriusBotが参加しているサーバーを管理できます。
			</Typography>
		</Box>
	);
}
