import { NextRequest, NextResponse } from "next/server";
import { getGroup, getAllGroups } from "@/lib/store";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (id) {
    const group = await getGroup(parseInt(id));
    return NextResponse.json(group);
  }

  const groups = await getAllGroups();
  return NextResponse.json(groups);
}
