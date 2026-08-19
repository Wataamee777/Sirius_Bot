"use client";

import {
	Box,
	Button,
	Card,
	CardContent,
	Checkbox,
	Container,
	CssBaseline,
	createTheme,
	FormControl,
	FormControlLabel,
	Stack,
	TextField,
	ThemeProvider,
	Typography,
} from "@mui/material";
import NextLink from "@/components/NextLink";

const darkTheme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#5865F2",
		},
		background: {
			default: "#08090f",
			paper: "#12131a",
		},
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
	},
});

export default function EconomyCreateForm() {
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = new FormData(e.currentTarget as HTMLFormElement);
		const res = await fetch("/api/economy/create", {
			method: "POST",
			body: form,
		});
		const data = await res.json();
		if (res.ok && data.redirect) {
			window.location.href = data.redirect;
			return;
		}
		alert(data?.error ?? "アカウント作成中にエラーが発生しました。");
	};

	return (
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<Container maxWidth="sm" sx={{ minHeight: "100vh", py: 8 }}>
				<Card
					elevation={16}
					sx={{
						bgcolor: "background.paper",
						border: "1px solid rgba(255,255,255,0.08)",
						borderRadius: 4,
						p: { xs: 2, sm: 3 },
						boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
					}}
				>
					<CardContent>
						<Box sx={{ mb: 3 }}>
							<Typography variant="h4" component="h1" gutterBottom>
								経済アカウントの作成
							</Typography>
							<Typography color="text.secondary">
								SiriusBotの経済アカウントを作成し、経済機能を使えるようにします。
							</Typography>
						</Box>

						<Box component="form" onSubmit={handleSubmit} noValidate>
							<Stack spacing={3}>
								<TextField
									label="表示名"
									name="name"
									required
									fullWidth
									variant="filled"
									placeholder="表示名を入力"
								/>

								<TextField
									label="誕生日"
									name="birthday"
									type="date"
									required
									fullWidth
									variant="filled"
								/>

								<FormControl component="fieldset" required>
									<FormControlLabel
										control={
											<Checkbox
												name="acceptedTerms"
												value="on"
												required
												color="primary"
											/>
										}
										label="利用規約に同意します"
									/>
									<FormControlLabel
										control={
											<Checkbox
												name="acceptedPrivacy"
												value="on"
												required
												color="primary"
											/>
										}
										label="プライバシーポリシーに同意します"
									/>
								</FormControl>

								<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
									<Button
										type="submit"
										variant="contained"
										size="large"
										fullWidth
									>
										経済アカウントを作成
									</Button>
									<Button
										component={NextLink}
										href="/mypage"
										variant="outlined"
										size="large"
										fullWidth
									>
										マイページに戻る
									</Button>
								</Stack>
							</Stack>
						</Box>

						<Box
							sx={{
								mt: 4,
								display: "flex",
								gap: 2,
								flexWrap: "wrap",
								justifyContent: "center",
							}}
						>
							<Button component={NextLink} href="/terms" size="small">
								利用規約を見る
							</Button>
							<Button component={NextLink} href="/privacy" size="small">
								プライバシーポリシーを見る
							</Button>
						</Box>
					</CardContent>
				</Card>
			</Container>
		</ThemeProvider>
	);
}
