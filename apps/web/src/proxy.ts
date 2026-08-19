import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type AccessRecord = {
	count: number;
	startTime: number;
	blockedUntil: number;
};

const ipCache = new Map<string, AccessRecord>();

const LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 500;
const BLOCK_DURATION = 30 * 60 * 1000;

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const now = Date.now();
	const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

	// --- 手動解除 API パス (/api/unb/) ---
	if (pathname === "/api/unb/" || pathname === "/api/unb") {
		// 解除は POST のみ。それ以外はティーポット扱い
		if (request.method !== "POST") {
			return new NextResponse(
				JSON.stringify({
					error: "I'm a teapot",
					message: "I'm a teapot. ",
				}),
				{ status: 418, headers: { "Content-Type": "application/json" } },
			);
		}

		// POST の解除ロジック
		const authHeader = request.headers.get("Authorization");
		const unbToken = process.env.UNB_TOKEN;

		if (!unbToken || authHeader !== unbToken) {
			return NextResponse.json(
				{ error: "Unauthorized or unexpected token" },
				{ status: 401 },
			);
		}

		try {
			const body = await request.json();
			const targetIp = body.ip;

			if (targetIp && ipCache.has(targetIp)) {
				ipCache.delete(targetIp);
				return NextResponse.json({ message: `IP ${targetIp} unblocked.` });
			}
			return NextResponse.json({ error: "IP not found" }, { status: 404 });
		} catch {
			return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
		}
	}

	// --- 通常の DoS 対策 (429 Too Many Requests) ---
	const WHITE_LIST = new Set(["60.60.94.147", "127.0.0.1"]);

	// proxy関数内
	if (WHITE_LIST.has(ip)) {
		return NextResponse.next();
	}

	let record = ipCache.get(ip);

	if (record && record.blockedUntil > now) {
		return new NextResponse(
			JSON.stringify({
				error: "Too Many Requests",
				message:
					"Your IP is temporarily blocked for 30 minutes due to excessive requests.",
			}),
			{ status: 429, headers: { "Content-Type": "application/json" } },
		);
	}

	if (!record || now - record.startTime > LIMIT_WINDOW) {
		record = { count: 1, startTime: now, blockedUntil: 0 };
	} else {
		record.count++;
	}

	if (record.count > MAX_REQUESTS) {
		record.blockedUntil = now + BLOCK_DURATION;
		ipCache.set(ip, record);

		return new NextResponse(
			JSON.stringify({
				error: "Too Many Requests",
				message: "Excessive requests detected. Blocked for 30 minutes.",
			}),
			{ status: 429, headers: { "Content-Type": "application/json" } },
		);
	}

	ipCache.set(ip, record);
	return NextResponse.next();
}

export const config = {
	matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
