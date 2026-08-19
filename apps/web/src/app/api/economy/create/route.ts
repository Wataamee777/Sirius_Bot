import { NextResponse } from "next/server";
import { createEconomyAccount } from "@/lib/economy-actions";

export async function POST(req: Request) {
	try {
		const formData = await req.formData();
		const result = await createEconomyAccount(
			null,
			formData as unknown as FormData,
		);

		if (result?.error) {
			return NextResponse.json(
				{ ok: false, error: result.error },
				{ status: 400 },
			);
		}

		return NextResponse.json({ ok: true, redirect: "/dashboard" });
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		return NextResponse.json({ ok: false, error: message }, { status: 400 });
	}
}
