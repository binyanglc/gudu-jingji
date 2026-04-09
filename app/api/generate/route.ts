import { NextResponse } from "next/server";
import OpenAI from "openai";
import { put } from "@vercel/blob";
import { getGroup, setGroup, getGroupMeta } from "@/lib/store";

export const maxDuration = 60;

const MAX_GENERATIONS = 5;

async function persistImage(
  tempUrl: string,
  groupId: number,
  genCount: number
): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return tempUrl;
  }

  const res = await fetch(tempUrl);
  const blob = await res.blob();
  const { url } = await put(
    `group-${groupId}/gen-${genCount}.png`,
    blob,
    { access: "public", contentType: "image/png", addRandomSuffix: true }
  );
  return url;
}

export async function POST(req: Request) {
  try {
    const { groupId, productName, description, imgPlace, imgWho, imgAction, imgStyle } = await req.json();

    if (!productName?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: "Please fill in both product name and description." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API Key not configured" },
        { status: 500 }
      );
    }

    const id = parseInt(groupId);
    const group = await getGroup(id);

    if (group?.submitted) {
      return NextResponse.json(
        { error: "Already submitted. Cannot generate again." },
        { status: 400 }
      );
    }

    const currentCount = group?.generationCount ?? 0;
    if (currentCount >= MAX_GENERATIONS) {
      return NextResponse.json(
        { error: `Generation limit reached (${MAX_GENERATIONS})` },
        { status: 429 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const imageDescParts = [
      imgPlace?.trim() && `地方: ${imgPlace.trim()}`,
      imgWho?.trim() && `谁: ${imgWho.trim()}`,
      imgAction?.trim() && `在做什么: ${imgAction.trim()}`,
      imgStyle?.trim() && `风格: ${imgStyle.trim()}`,
    ].filter(Boolean).join("\n");

    const promptResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a product concept illustrator. Given a Chinese scene description for a product/service in the 'loneliness economy' (孤独经济), create a detailed DALL-E 3 prompt in English. Follow the user's scene description closely: the place, characters, action, and style they specified. IMPORTANT: Generate ONE single cohesive scene, NOT a collage, NOT multiple panels, NOT split images. If no style is specified, default to flat design with soft warm colors. Do NOT include any text or words in the image. Output ONLY the English prompt, under 150 words.",
        },
        {
          role: "user",
          content: `产品名称: ${productName}\n\n图片场景描述:\n${imageDescParts}`,
        },
      ],
      max_tokens: 250,
    });

    const imagePrompt =
      promptResponse.choices[0].message.content ?? description;

    let tempImageUrl: string;
    try {
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });
      tempImageUrl = imageResponse.data?.[0]?.url ?? "";
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Image generation failed";
      if (msg.includes("content_policy")) {
        return NextResponse.json(
          { error: "Content policy violation. Please revise your description. (does not count as an attempt)" },
          { status: 400 }
        );
      }
      throw err;
    }

    const meta = getGroupMeta(id);
    const newCount = currentCount + 1;

    const imageUrl = await persistImage(tempImageUrl, id, newCount);

    await setGroup(id, {
      id,
      name: meta.name,
      productName: productName.trim(),
      description: description.trim(),
      imgPlace: imgPlace?.trim() || "",
      imgWho: imgWho?.trim() || "",
      imgAction: imgAction?.trim() || "",
      imgStyle: imgStyle?.trim() || "",
      imageUrl,
      submitted: false,
      generationCount: newCount,
    });

    return NextResponse.json({ imageUrl, generationCount: newCount });
  } catch (err: unknown) {
    console.error("Generate error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Generation failed: ${message}` },
      { status: 500 }
    );
  }
}
