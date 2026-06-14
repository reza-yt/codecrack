import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    object: "list",
    data: [
      {
        id: "codecrack",
        object: "model",
        created: 1700000000,
        owned_by: "codecrack",
      },
    ],
  });
}
