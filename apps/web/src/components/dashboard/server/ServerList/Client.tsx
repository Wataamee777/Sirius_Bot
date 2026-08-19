"use client";

import {
	Avatar,
	Box,
	Card,
	CardActionArea,
	CardContent,
	Chip,
	Grid,
	Typography,
} from "@mui/material";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export type Guild = {
	id: string;
	name: string;
	icon: string | null;
	owner: boolean;
};

export default function Client({ guilds }: { guilds: Guild[] }) {
	const router = useRouter();
	return (
		<Grid container spacing={3}>
			{guilds.map((guild) => (
				<Grid key={guild.id} size={{ xs: 12, md: 6, lg: 4 }}>
					<Card
						sx={{
							backdropFilter: "blur(12px)",
							background: "rgba(255,255,255,.03)",
							border: "1px solid rgba(255,255,255,.08)",
							transition: ".2s",
							"&:hover": {
								borderColor: "#5865F2",
								transform: "translateY(-4px)",
							},
						}}
					>
						<CardActionArea
							onClick={() => router.push(`/dashboard/server/${guild.id}`)}
						>
							<CardContent>
								<Box sx={{ display: "flex", justifyContent: "space-between" }}>
									<Avatar
										src={
											guild.icon
												? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
												: undefined
										}
									>
										{guild.name[0]}
									</Avatar>

									{guild.owner && (
										<Chip label="OWNER" color="warning" size="small" />
									)}
								</Box>

								<Typography
									variant="h6"
									sx={{ mt: 2, color: "rgba(255,255,255,0.85)" }}
								>
									{guild.name}
								</Typography>

								<Typography
									variant="caption"
									sx={{ color: "rgba(255,255,255,0.85)" }}
								>
									{guild.id}
								</Typography>

								<Box
									sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
								>
									<ChevronRight />
								</Box>
							</CardContent>
						</CardActionArea>
					</Card>
				</Grid>
			))}
		</Grid>
	);
}
