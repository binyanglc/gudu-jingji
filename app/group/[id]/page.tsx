"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const GROUP_META: Record<string, { name: string; members: number }> = {
  "1": { name: "第一组", members: 3 },
  "2": { name: "第二组", members: 3 },
  "3": { name: "第三组", members: 3 },
  "4": { name: "第四组", members: 2 },
  "5": { name: "老师体验组", members: 0 },
};

const MAX_GEN = 5;

const VOCAB = [
  "消费", "需求", "品质", "个性", "各种", "甚至", "方面", "培养",
  "专业", "稳定", "支持", "超过", "占", "年龄", "青年", "中年",
  "价格", "解决", "机器人", "养老", "教育", "积蓄", "工资", "贷款",
];

const GRAMMAR = [
  { id: 1, name: "疑问代词任指", example: "什么……都……  /  谁……都……" },
  { id: 2, name: "分数 / 百分数 / 倍数", example: "三分之一 / 百分之六十 / 两倍" },
  { id: 3, name: "除了……以外，还/也……", example: "除了价格以外，还要考虑品质" },
  { id: 4, name: "一……也/都+没/不……", example: "一分钱都不浪费" },
];

const PLACEHOLDER = `参考模板（可自由发挥）：

这是一个为______（目标人群）设计的______（产品名称）。现在，超过百分之______的______人______。除了______以外，他们还______。这个产品很______，什么______都能______。对______来说，一______也/都不______。`;

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
      setError("请填写产品名称和产品介绍");
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
        setError(data.error || "生成失败");
        return;
      }
      setImageUrl(data.imageUrl);
      setGenCount(data.generationCount);
    } catch {
      setError("网络错误，请重试");
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
        setError(data.error || "提交失败");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  if (!meta) return null;

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-lg">加载中...</div>
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
            返回
          </Link>
          <div className="text-center">
            <span className="font-bold text-gray-900">{meta.name}</span>
            {meta.members > 0 && (
              <span className="text-gray-400 text-sm ml-2">{meta.members}人</span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {genCount}/{MAX_GEN} 次
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
              📋 词汇和语法提示
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
                  必须使用的生词（至少 5 个）
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
                  必须使用的语法（至少 2 个）
                </h3>
                <div className="space-y-2">
                  {GRAMMAR.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                        {g.id}
                      </span>
                      <div>
                        <span className="font-medium text-gray-900">
                          {g.name}
                        </span>
                        <span className="text-gray-500 ml-2">
                          {g.example}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Input Area */}
        <section className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              产品 / 服务名称
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder='例如：智能陪伴机器人、"不孤单"社交平台'
              disabled={submitted}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              产品介绍（此文字将直接用于生成图片）
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={PLACEHOLDER}
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
                AI 正在创作中...（约 15-30 秒）
              </span>
            ) : genCount >= MAX_GEN ? (
              "已达到生成上限"
            ) : (
              `🎨 生成图片（${genCount}/${MAX_GEN}）`
            )}
          </button>
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
                  alt="AI 生成的产品概念图"
                  className="w-full aspect-square object-cover"
                />
              </div>
            ) : null}
          </section>
        )}

        {/* Submit Button */}
        {imageUrl && !submitted && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3.5 rounded-xl font-medium text-white bg-gray-900 hover:bg-gray-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
          >
            {submitting ? "提交中..." : "✅ 提交最终作品"}
          </button>
        )}

        {/* Submitted State */}
        {submitted && (
          <div className="text-center py-8 animate-fade-in">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              提交成功！
            </h2>
            <p className="text-gray-500 text-sm">
              你们的作品已经出现在展示墙上了，准备好上台展示吧！
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
