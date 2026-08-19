"use client";

import { Add, Delete } from "@mui/icons-material";
import { Box, Button, IconButton, Paper, TextField } from "@mui/material";
import ChannelSelect from "@/components/dashboard/server/settings/ui/ChannelSelect";
import { normalizeAutoReactions } from "@/lib/autoReactions";

type Props = {
	reactions: unknown;
	channels: {
		id: string;
		name: string;
	}[];
	onChange: (reactions: { channelId: string; emoji: string }[]) => void;
};

export default function AutoReact({ reactions, channels, onChange }: Props) {
	const safeReactions = normalizeAutoReactions(reactions).map((r, i) => ({
		...r,
		__key: `${r.channelId}:${r.emoji}:${i}`,
	}));

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
			{safeReactions.map((reaction) => (
				<Paper
					key={reaction.__key}
					sx={{
						p: 2,
						position: "relative",
					}}
				>
					<IconButton
						size="small"
						sx={{
							position: "absolute",
							top: 8,
							right: 8,
						}}
						onClick={() => {
							const filtered = safeReactions.filter(
								(r) => r.__key !== reaction.__key,
							);
							onChange(filtered.map(({ __key, ...rest }) => rest));
						}}
					>
						<Delete />
					</IconButton>

					<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
						<ChannelSelect
							label="チャンネル"
							value={reaction.channelId}
							channels={[
								{
									id: "all",
									name: "全チャンネル",
								},
								...channels,
							]}
							onChange={(v) => {
								const copy = safeReactions.map((r) => ({ ...r }));
								const idx = copy.findIndex((c) => c.__key === reaction.__key);
								if (idx >= 0) copy[idx].channelId = v;
								onChange(copy.map(({ __key, ...rest }) => rest));
							}}
						/>

						<TextField
							label="絵文字"
							value={reaction.emoji}
							onChange={(e) => {
								const copy = safeReactions.map((r) => ({ ...r }));
								const idx = copy.findIndex((c) => c.__key === reaction.__key);
								if (idx >= 0) copy[idx].emoji = e.target.value;
								onChange(copy.map(({ __key, ...rest }) => rest));
							}}
							fullWidth
						/>
					</Box>
				</Paper>
			))}

			<Button
				startIcon={<Add />}
				variant="outlined"
				onClick={() =>
					onChange([
						...normalizeAutoReactions(reactions),
						{
							channelId: "all",
							emoji: "",
						},
					])
				}
			>
				追加
			</Button>
		</Box>
	);
}
