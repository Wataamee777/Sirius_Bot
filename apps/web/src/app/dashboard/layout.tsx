import Header from "@/components/dashboard/Header";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <Header>{children}</Header>;
}
