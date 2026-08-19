"use client";

import { ArrowForward } from "@mui/icons-material";

import { Box, Card, CardActionArea, Typography } from "@mui/material";

import { useRouter } from "next/navigation";

type Props = {
	title: string;
	description: string;
	href?: string;
	icon: React.ReactNode;
	onClick?: () => void;
};

export default function DashboardCard({
	title,
	description,
	href,
	icon,
	onClick,
}: Props) {
	const router = useRouter();

	return (
		<Card
			sx={{
				height: "100%",
				backdropFilter: "blur(12px)",
				background: "rgba(255,255,255,.03)",
				border: "1px solid rgba(255,255,255,.08)",
				transition: ".2s",
				"&:hover": {
					transform: "translateY(-4px)",
					borderColor: "#5865F2",
				},
			}}
		>
			<CardActionArea
				sx={{ p: 3, height: "100%" }}
				onClick={() => {
					if (onClick) {
						onClick();
						return;
					}
					router.push(href ?? "#");
				}}
			>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						color: "#fff",
					}}
				>
					<Box sx={{ color: "#fff", display: "flex", alignItems: "center" }}>
						{icon}
					</Box>
					<ArrowForward sx={{ color: "#fff" }} />
				</Box>

				<Typography variant="h6" sx={{ mt: 2, color: "#fff" }}>
					{title}
				</Typography>

				<Typography sx={{ mt: 1, color: "rgba(255,255,255,0.85)" }}>
					{description}
				</Typography>
			</CardActionArea>
		</Card>
	);
}
