import type { Metadata } from "next";
import "@/style/public.scss";
import Header from "@/components/public/Header";
import { BASE_URL } from "@/lib/constants";

export const metadata: Metadata = {
	title: {
		default: "Siriusbot",
		template: "%s - Siriusbot", // page.tsxのタイトルが %s に入ります
	},
	openGraph: {
		type: "website",
		title: {
			default: "Siriusbot",
			template: "%s - Siriusbot", // page.tsxのタイトルが %s に入ります
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
		<>
			<Header>{children}</Header>
			<footer> &copy; 2026 SiriusBot Developers All rights reserved</footer>
		</>
	);
}
