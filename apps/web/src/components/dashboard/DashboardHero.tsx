"use client";

import { Avatar, Box, Chip, Typography } from "@mui/material";

type Props = {
	user: {
		name?: string | null;
		image?: string | null;
	};
};

export default function DashboardHero({ user }: Props) {
	return (
		<Box
			sx={{
				mb: 4,
				p: 4,
				borderRadius: 4,
				backdropFilter: "blur(12px)",
				background: "rgba(255,255,255,.03)",
				border: "1px solid rgba(255,255,255,.08)",
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
				<Avatar
					src={user.image ?? undefined}
					sx={{
						width: 80,
						height: 80,
					}}
				/>

				<Box>
					<Typography
						variant="h4"
						sx={{
							fontWeight: "bold",
							background: "linear-gradient(45deg, #FF007A 0%, #00F0FF 100%)",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
						}}
					>
						Welcome Back
					</Typography>

					<Typography sx={{ mt: 1, color: "rgba(255,255,255,0.85)" }}>
						{user.name}
					</Typography>

					<Chip label="Discord Connected" sx={{ mt: 2, color: "#00ff00" }} />
				</Box>
			</Box>
		</Box>
	);
}
