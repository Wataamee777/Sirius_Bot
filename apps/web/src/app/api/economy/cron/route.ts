import { NextResponse } from "next/server";
import { runPeriodicEconomyProcessing } from "@/lib/economy-cron";

export async function POST(request: Request) {
	const token = request.headers
		.get("authorization")
		?.replace(/^Bearer\s+/i, "");
	const expected = process.env.ECONOMY_CRON_SECRET;

	if (!expected || token !== expected) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const result = await runPeriodicEconomyProcessing();
		return NextResponse.json({ ok: true, ...result });
	} catch (error) {
		console.error("economy cron error:", error);
		return NextResponse.json({ error: "Internal error" }, { status: 500 });
	}
}
