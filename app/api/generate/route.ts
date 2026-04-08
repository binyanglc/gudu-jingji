import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getGroup, setGroup, getGroupMeta } from "@/lib/store";

export const runtime = "edge";

const MAX_GENERATIONS = 5;

export async function POST(req: Request) {
  try {
    const { groupId, productName, description } = await req.json();

    if (!productName?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: "请填写产品名称和产品介绍" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API Key 未配置" },
        { status: 500 }
      );
    }

    const id = parseInt(groupId);
    const group = await getGroup(id);

    if (group?.submitted) {
      return NextResponse.json(
        { error: "已提交最终作品，无法再生成" },
        { status: 400 }
      );
    }

    const currentCount = group?.generationCount ?? 0;
    if (currentCount >= MAX_GENERATIONS) {
      return NextResponse.json(
        { error: `已达到生成上限（${MAX_GENERATIONS}次）` },
        { status: 429 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const promptResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a product concept illustrator. Given a Chinese product/service description targeting the 'loneliness economy' (孤独经济), create a detailed DALL-E 3 prompt in English for a modern, clean product concept illustration. IMPORTANT: Generate ONE single cohesive scene, NOT a collage, NOT multiple panels, NOT split images. Style: flat design, soft warm colors, friendly and inviting. Show the product being used by a person in a single unified scene. Output ONLY the English prompt, under 150 words.",
        },
        {
          role: "user",
          content: `产品名称: ${productName}\n\n产品介绍: ${description}`,
        },
      ],
      max_tokens: 250,
    });

    const imagePrompt =
      promptResponse.choices[0].message.content ?? description;

    let imageUrl: string;
    try {
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });
      imageUrl = imageResponse.data?.[0]?.url ?? "";
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "图片生成失败";
      if (msg.includes("content_policy")) {
        return NextResponse.json(
          { error: "图片内容不符合规范，请修改描述后重试（不扣次数）" },
          { status: 400 }
        );
      }
      throw err;
    }

    const meta = getGroupMeta(id);
    const newCount = currentCount + 1;

    await setGroup(id, {
      id,
      name: meta.name,
      productName: productName.trim(),
      description: description.trim(),
      imageUrl,
      submitted: false,
      generationCount: newCount,
    });

    return NextResponse.json({ imageUrl, generationCount: newCount });
  } catch (err: unknown) {
    console.error("Generate error:", err);
    const message = err instanceof Error ? err.message : "未知错误";
    return NextResponse.json(
      { error: `生成失败: ${message}` },
      { status: 500 }
    );
  }
}
