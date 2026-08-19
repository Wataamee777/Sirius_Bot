"use client";

import {
	Box,
	Chip,
	Container,
	CssBaseline,
	Paper,
	Stack,
	ThemeProvider,
	Typography,
} from "@mui/material";
import { createTheme } from "@mui/material/styles";
import Link from "next/link";
import LoginButton from "@/components/LoginButton";

const darkTheme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#5865F2",
		},
		secondary: {
			main: "#9b59b6",
		},
		background: {
			default: "#0a0a0c",
			paper: "#16161a",
		},
	},
});

export default function LoginClient() {
	return (
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />

			<Box
				sx={{
					minHeight: "100vh",
					position: "relative",
					overflow: "hidden",
					background: "#0a0a0c",

					"&::before": {
						content: '""',
						position: "absolute",
						inset: 0,
						background:
							"radial-gradient(circle at 20% 20%, rgba(88,101,242,0.25), transparent 40%), radial-gradient(circle at 80% 30%, rgba(155,89,182,0.25), transparent 40%)",
					},
				}}
			>
				<Container
					maxWidth="sm"
					sx={{
						minHeight: "100vh",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						position: "relative",
						zIndex: 1,
					}}
				>
					<Paper
						elevation={0}
						sx={{
							width: "100%",
							p: 6,
							borderRadius: 6,
							textAlign: "center",

							background: "rgba(255,255,255,0.04)",
							backdropFilter: "blur(24px)",

							border: "1px solid rgba(255,255,255,0.08)",

							boxShadow:
								"0 20px 80px rgba(0,0,0,0.45), 0 0 60px rgba(88,101,242,0.15)",
						}}
					>
						<Stack
							direction="row"
							spacing={1}
							sx={{
								mb: 3,
								justifyContent: "center",
							}}
						>
							<Chip label="Discord OAuth2" color="primary" size="small" />
							<Chip label="Secure Login" color="secondary" size="small" />
						</Stack>

						<Typography
							variant="h2"
							sx={{
								fontWeight: 900,
								mb: 2,
								background: "linear-gradient(135deg,#5865F2 0%,#9b59b6 100%)",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
								letterSpacing: "-0.04em",
							}}
						>
							SiriusBot
						</Typography>

						<Typography
							variant="h5"
							sx={{
								mb: 1,
								fontWeight: 700,
							}}
						>
							Dashboard Login
						</Typography>

						<Typography
							color="text.secondary"
							sx={{
								mb: 5,
								maxWidth: 420,
								mx: "auto",
								lineHeight: 1.8,
							}}
						>
							Discordアカウントでログインして
							SiriusBotのダッシュボードへアクセスします。
						</Typography>

						<LoginButton />

						<Box
							sx={{
								mt: 4,
								textAlign: "center",
								fontSize: "0.875rem",
								color: "text.secondary",
								opacity: 0.7,
							}}
						>
							ログインすると
							<Link href="/terms">利用規約</Link>・
							<Link href="/privacy">プライバシーポリシー</Link>
							に同意したものとみなされます。
						</Box>
					</Paper>
				</Container>
			</Box>
		</ThemeProvider>
	);
}
