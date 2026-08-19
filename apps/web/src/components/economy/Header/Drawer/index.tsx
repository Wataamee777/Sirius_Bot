"use client";

import AddIcon from "@mui/icons-material/Add";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import GavelIcon from "@mui/icons-material/Gavel";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import Divider from "@mui/material/Divider";
import MuiDrawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { type CSSObject, styled, type Theme } from "@mui/material/styles";
import { usePathname } from "next/navigation";
import type React from "react";
import NextLink from "@/components/NextLink";

export const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
	width: drawerWidth,
	transition: theme.transitions.create("width", {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.enteringScreen,
	}),
	overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
	transition: theme.transitions.create("width", {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	overflowX: "hidden",
	width: `calc(${theme.spacing(7)} + 1px)`,
	[theme.breakpoints.up("sm")]: {
		width: `calc(${theme.spacing(8)} + 1px)`,
	},
});

const CustomDrawer = styled(MuiDrawer, {
	shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
	width: drawerWidth,
	flexShrink: 0,
	whiteSpace: "nowrap",
	boxSizing: "border-box",
	variants: [
		{
			props: ({ open }) => open,
			style: {
				...openedMixin(theme),
				"& .MuiDrawer-paper": openedMixin(theme),
			},
		},
		{
			props: ({ open }) => !open,
			style: {
				...closedMixin(theme),
				"& .MuiDrawer-paper": closedMixin(theme),
			},
		},
	],
}));

export const DrawerHeader = styled("div")(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	justifyContent: "flex-end",
	padding: theme.spacing(0, 1),
	...theme.mixins.toolbar,
}));

const dashboardItems = [
	{
		text: "ユーザー情報",
		href: "/economy",
		icon: <PersonIcon />,
	},
	{
		text: "新規作成",
		href: "/economy/create",
		icon: <AddIcon />,
	},
];

const adminItems = [
	{
		text: "管理者ページ",
		href: "/economy/admin",
		icon: <AdminPanelSettingsIcon />,
	},
];

const helpItems = [
	{
		text: "利用規約",
		href: "/terms",
		icon: <GavelIcon />,
	},
	{
		text: "プライバシー",
		href: "/privacy",
		icon: <LockIcon />,
	},
];

export default function Drawer({
	theme,
	open,
	handleDrawerClose,
	isAdmin = false,
}: {
	theme: Theme;
	open: boolean;
	handleDrawerClose: () => void;
	isAdmin?: boolean;
}) {
	const pathname = usePathname();

	const renderItem = (text: string, href: string, icon: React.ReactNode) => (
		<ListItem key={href} disablePadding sx={{ display: "block" }}>
			<ListItemButton
				component={NextLink}
				href={href}
				selected={pathname === href}
				sx={{
					minHeight: 48,
					px: 2.5,
					justifyContent: open ? "initial" : "center",
					borderRadius: 2,
					mx: 1,
				}}
			>
				<ListItemIcon
					sx={{
						minWidth: 0,
						justifyContent: "center",
						mr: open ? 3 : "auto",
					}}
				>
					{icon}
				</ListItemIcon>

				<ListItemText
					primary={text}
					sx={{
						opacity: open ? 1 : 0,
					}}
				/>
			</ListItemButton>
		</ListItem>
	);

	return (
		<CustomDrawer variant="permanent" open={open}>
			<DrawerHeader>
				<IconButton onClick={handleDrawerClose}>
					{theme.direction === "rtl" ? (
						<ChevronRightIcon />
					) : (
						<ChevronLeftIcon />
					)}
				</IconButton>
			</DrawerHeader>

			<Divider />

			<List>
				{dashboardItems.map((item) =>
					renderItem(item.text, item.href, item.icon),
				)}
			</List>

			{isAdmin ? (
				<>
					<Divider />
					<List>
						{adminItems.map((item) =>
							renderItem(item.text, item.href, item.icon),
						)}
					</List>
				</>
			) : null}

			<Divider />

			<List>
				{helpItems.map((item) => renderItem(item.text, item.href, item.icon))}
			</List>
		</CustomDrawer>
	);
}
