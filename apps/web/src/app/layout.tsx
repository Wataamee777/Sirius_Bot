import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { BASE_URL } from "@/lib/constants";
import "@/style/base.scss";

export const metadata: Metadata = {
	title: {
		default: "Siriusbot",
		template: "%s - Siriusbot",
	},
	openGraph: {
		type: "website",
		title: {
			default: "Siriusbot",
			template: "%s - Siriusbot",
		},
		images: [{ url: `${BASE_URL}/assets/ogp.gif` }],
	},
	twitter: {
		card: "summary_large_image",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="ja">
			<head>
				<link
					href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&display=optional"
					rel="stylesheet"
				/>
			</head>
			<body>
				<GoogleAnalytics gaId="G-Y6YLF1YXX6" />
				{children}
			</body>
		</html>
	);
}
