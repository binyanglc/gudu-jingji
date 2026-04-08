import { NextResponse } from "next/server";
import { resetAllGroups } from "@/lib/store";

export async function POST() {
  try {
    await resetAllGroups();
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Reset error:", err);
    return NextResponse.json(
      { error: "重置失败" },
      { status: 500 }
    );
  }
}
