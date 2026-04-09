import { NextResponse } from "next/server";
import { getRedisStatus, getGroup } from "@/lib/store";

export async function GET() {
  const redis = getRedisStatus();

  let testResult = "skipped";
  if (redis.connected) {
    try {
      const data = await getGroup(1);
      testResult = data ? `found group 1: ${data.productName}` : "group 1 is empty";
    } catch (err: unknown) {
      testResult = `error: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  return NextResponse.json({
    redis,
    testRead: testResult,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
  });
}
