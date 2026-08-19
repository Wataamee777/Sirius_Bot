"use client";

import {
	Help,
	Person,
	Savings,
	Settings as SettingsIcon,
	Stars,
} from "@mui/icons-material";

import { Grid } from "@mui/material";

import DashboardCard from "./DashboardCard";

type DashboardGridProps = {
	modules?: {
		id: string;
		title: string;
		description: string;
	}[];
	onClick?: (id: string) => void;
};

export default function DashboardGrid({
	modules,
	onClick,
}: DashboardGridProps) {
	if (modules) {
		return (
			<Grid container spacing={3}>
				{modules.map((module) => (
					<Grid key={module.id} size={{ xs: 12, md: 6 }}>
						<DashboardCard
							title={module.title}
							description={module.description}
							icon={<SettingsIcon />}
							onClick={() => onClick?.(module.id)}
						/>
					</Grid>
				))}
			</Grid>
		);
	}

	return (
		<Grid container spacing={3}>
			<Grid size={{ xs: 12, md: 6 }}>
				<DashboardCard
					title="ユーザー設定"
					description="プロフィールやアカウント設定"
					href="/dashboard/user"
					icon={<Person />}
				/>
			</Grid>

			<Grid size={{ xs: 12, md: 6 }}>
				<DashboardCard
					title="サーバー管理"
					description="管理可能なサーバーを設定"
					href="/dashboard/server"
					icon={<SettingsIcon />}
				/>
			</Grid>

			<Grid size={{ xs: 12, md: 6 }}>
				<DashboardCard
					title="経済システム"
					description="アカウント作成・所属設定・ステータス確認"
					href="/economy"
					icon={<Savings />}
				/>
			</Grid>

			<Grid size={{ xs: 12, md: 6 }}>
				<DashboardCard
					title="XPシステム"
					description="Coming Soon"
					href="#"
					icon={<Stars />}
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<DashboardCard
					title="使い方"
					description="Webダッシュボードの説明"
					href="/how-to-use"
					icon={<Help />}
				/>
			</Grid>
		</Grid>
	);
}
