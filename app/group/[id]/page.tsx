"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const GROUP_META: Record<string, { name: string; nameZh: string; members: number }> = {
  "1": { name: "Group 1", nameZh: "第一组", members: 3 },
  "2": { name: "Group 2", nameZh: "第二组", members: 3 },
  "3": { name: "Group 3", nameZh: "第三组", members: 3 },
  "4": { name: "Group 4", nameZh: "第四组", members: 2 },
  "5": { name: "Teacher Demo", nameZh: "老师体验组", members: 0 },
};

const MAX_GEN = 5;

const VOCAB = [
  "消费", "需求", "品质", "个性", "各种", "甚至",
  "支持", "培养", "青年", "中年", "解决", "考虑",
  "扫", "机器人", "教育", "可见", "玩具",
];

const GRAMMAR = [
  {
    id: 1,
    pattern: "什么时候都 / 谁都 / 什么都……",
    english: "whenever / whoever / whatever...",
    examples: [
      "我们的产品什么时候都可以用，就算是晚上12点也可以用。",
      "刚到新的城市，谁都不认识，那怎么办呢？",
    ],
  },
  {
    id: 2,
    pattern: "number 分之 number",
    english: "X out of Y / X percent",
    examples: [
      "超过百分之六十的年轻人有这个需求。",
    ],
  },
  {
    id: 3,
    pattern: "除了……以外，还/也……\n除了……以外，都……",
    english: "In addition to..., also... / Except for..., all...",
    examples: [
      "除了可以喝咖啡以外，人们还可以跟店里的宠物玩。",
    ],
  },
  {
    id: 4,
    pattern: "一……也/都 + 不/没……",
    english: "not even a little... / not... at all",
    examples: [
      "用了这个产品，一点儿都不孤独了。",
    ],
  },
];

const PITCH_GUIDE = [
  {
    step: 1,
    title: "The Problem",
    titleZh: "需求 & 问题",
    hint: "What problem exists? How many people have this need?",
    hintZh: "现在有什么问题？多少人有这样的需求？",
  },
  {
    step: 2,
    title: "Your Solution",
    titleZh: "你的产品",
    hint: "What is your product? Who is it designed for?",
    hintZh: "你的产品叫什么？是为谁设计的？",
  },
  {
    step: 3,
    title: "Key Features",
    titleZh: "功能 & 特点",
    hint: "What's special about it? What can people do with it?",
    hintZh: "你的产品有什么特别的？跟别的有什么不一样？",
  },
  {
    step: 4,
    title: "Impact",
    titleZh: "效果 & 影响",
    hint: "What changes after using it? What problem does it solve?",
    hintZh: "用了以后有什么变化？解决了什么问题？",
  },
];

const SAMPLE_TEXT = `现在很多青年一个人住在大城市，什么时候都是一个人吃饭。百分之六十的年轻人觉得一个人去餐厅很不好意思。可见，一个人吃饭的需求很大，但是各种餐厅都不考虑这些人。

"不孤单"一人食餐厅就是为他们设计的。除了可以一个人安静地吃饭以外，每个座位还有一个小机器人玩具陪你聊天。我们培养了专业的厨师，支持高品质的个性化菜单。

用了我们的服务，一点儿都不觉得孤独了！甚至很多消费者觉得一个人吃饭比跟朋友吃饭还自在。来扫我们的二维码，解决你一个人吃饭的问题吧！`;

export default function GroupWorkspace() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  const meta = GROUP_META[groupId];

  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [genCount, setGenCount] = useState(0);
  const [error, setError] = useState("");
  const [showGuide, setShowGuide] = useState(true);
  const [showPitch, setShowPitch] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`/api/groups?id=${groupId}`);
      const data = await res.json();
      if (data) {
        setProductName(data.productName || "");
        setDescription(data.description || "");
        setImageUrl(data.imageUrl || null);
        setSubmitted(data.submitted || false);
        setGenCount(data.generationCount || 0);
      }
    } finally {
      setPageLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (!meta) {
      router.replace("/");
      return;
    }
    loadData();
  }, [meta, router, loadData]);

  async function handleGenerate() {
    if (!productName.trim() || !description.trim()) {
      setError("Please fill in both product name and description.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, productName, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Generation failed");
        return;
      }
      setImageUrl(data.imageUrl);
      setGenCount(data.generationCount);
    } catch {
      setError("Network error, please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!imageUrl) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Submission failed");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Submission failed, please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!meta) return null;

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div className="text-center">
            <span className="font-bold text-gray-900">{meta.name}</span>
            {meta.members > 0 && (
              <span className="text-gray-400 text-sm ml-2">{meta.members} members</span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {genCount}/{MAX_GEN} used
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Vocabulary & Grammar Guide */}
        <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">
              📋 Vocabulary &amp; Grammar Reference
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${showGuide ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showGuide && (
            <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
              <div>
                <h3 className="text-sm font-medium text-rose-600 mb-2">
                  Required Vocabulary (use at least 5)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {VOCAB.map((w) => (
                    <span
                      key={w}
                      className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-full text-sm"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-amber-600 mb-2">
                  Required Grammar (use at least 2)
                </h3>
                <div className="space-y-3">
                  {GRAMMAR.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold mt-0.5">
                        {g.id}
                      </span>
                      <div>
                        {g.pattern.split("\n").map((line, i) => (
                          <div key={i} className="font-medium text-gray-900">
                            {line}
                          </div>
                        ))}
                        <div className="text-blue-600 text-xs mt-0.5">
                          {g.english}
                        </div>
                        {g.examples.map((ex, i) => (
                          <div key={i} className="text-gray-400 italic mt-0.5">
                            e.g. {ex}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Pitch Guide */}
        <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowPitch(!showPitch)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">
              🗣️ How to Structure Your Pitch 产品介绍思路
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${showPitch ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showPitch && (
            <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-3">
              {PITCH_GUIDE.map((p) => (
                <div key={p.step} className="flex items-start gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                    {p.step}
                  </span>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {p.title} {p.titleZh}
                    </div>
                    <div className="text-gray-500">{p.hint}</div>
                    <div className="text-gray-400">{p.hintZh}</div>
                  </div>
                </div>
              ))}

              {/* Sample toggle */}
              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={() => setShowSample(!showSample)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  {showSample ? "▾ Hide Example 隐藏示例" : "▸ Show Example 查看示例：一人食餐厅 \"不孤单\""}
                </button>
                {showSample && (
                  <div className="mt-3 p-4 bg-indigo-50 rounded-xl text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    <div className="font-medium text-indigo-800 mb-2">
                      一人食餐厅 &quot;不孤单&quot;
                    </div>
                    {SAMPLE_TEXT}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Input Area */}
        <section className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Product / Service Name 产品名称
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              disabled={submitted}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Product Description 产品介绍（used to generate the image）
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitted}
              rows={8}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all resize-none disabled:bg-gray-50 disabled:text-gray-500 text-sm leading-relaxed"
            />
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm animate-fade-in">
            {error}
          </div>
        )}

        {/* Generate Button */}
        {!submitted && (
          <div className="space-y-2">
            <button
              onClick={handleGenerate}
              disabled={loading || genCount >= MAX_GEN}
              className="w-full py-3.5 rounded-xl font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-sm hover:shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  AI is generating... (~15-30s)
                </span>
              ) : genCount >= MAX_GEN ? (
                "Generation limit reached"
              ) : genCount === 0 ? (
                `🎨 Generate Image`
              ) : (
                `🎨 Regenerate Image (${MAX_GEN - genCount} left)`
              )}
            </button>
            <p className="text-xs text-center text-gray-400">
              {genCount >= MAX_GEN
                ? "You've used all 5 attempts. Please submit your current image."
                : `You can edit your text and regenerate up to ${MAX_GEN} times total. Pick your favorite before submitting!`}
            </p>
          </div>
        )}

        {/* Generated Image */}
        {(imageUrl || loading) && (
          <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {loading && !imageUrl ? (
              <div className="aspect-square animate-shimmer" />
            ) : imageUrl ? (
              <div className="animate-fade-in">
                <img
                  src={imageUrl}
                  alt="AI generated product concept"
                  className="w-full aspect-square object-cover"
                />
              </div>
            ) : null}
          </section>
        )}

        {/* Submit Button */}
        {imageUrl && !submitted && (
          <div className="space-y-2">
            <button
              onClick={() => {
                if (confirm("Are you sure? Once submitted, you cannot edit or regenerate.\n确定提交吗？提交后不能再修改。")) {
                  handleSubmit();
                }
              }}
              disabled={submitting}
              className="w-full py-3.5 rounded-xl font-medium text-white bg-gray-900 hover:bg-gray-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "✅ Submit Final Work"}
            </button>
            <p className="text-xs text-center text-amber-600">
              ⚠️ Once submitted, your work cannot be changed. Make sure you are happy with your image!
            </p>
          </div>
        )}

        {/* Submitted State */}
        {submitted && (
          <div className="text-center py-8 animate-fade-in">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Submitted!
            </h2>
            <p className="text-gray-500 text-sm">
              Your work is now on the gallery wall. Get ready to present!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
