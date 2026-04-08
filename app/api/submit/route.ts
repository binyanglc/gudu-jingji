import { NextResponse } from "next/server";
import { getGroup, setGroup } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const { groupId } = await req.json();
    const id = parseInt(groupId);
    const group = await getGroup(id);

    if (!group) {
      return NextResponse.json(
        { error: "请先生成图片再提交" },
        { status: 400 }
      );
    }

    if (!group.imageUrl) {
      return NextResponse.json(
        { error: "请先生成图片再提交" },
        { status: 400 }
      );
    }

    if (group.submitted) {
      return NextResponse.json(
        { error: "已经提交过了" },
        { status: 400 }
      );
    }

    await setGroup(id, { ...group, submitted: true });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Submit error:", err);
    return NextResponse.json(
      { error: "提交失败，请重试" },
      { status: 500 }
    );
  }
}
