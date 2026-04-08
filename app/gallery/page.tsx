"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface GroupData {
  id: number;
  name: string;
  productName: string;
  description: string;
  imageUrl: string | null;
  submitted: boolean;
  generationCount: number;
}

const PLACEHOLDER_NAMES = ["第一组", "第二组", "第三组", "第四组", "老师体验组"];

export default function Gallery() {
  const [groups, setGroups] = useState<(GroupData | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [resetting, setResetting] = useState(false);

  const loadGroups = useCallback(async () => {
    try {
      const res = await fetch("/api/groups");
      const data = await res.json();
      setGroups(data);
    } catch {
      // Silently retry on next interval
    }
  }, []);

  useEffect(() => {
    loadGroups();
    const interval = setInterval(loadGroups, 5000);
    return () => clearInterval(interval);
  }, [loadGroups]);

  async function handleReset() {
    if (!confirm("确定要重置所有组的数据吗？此操作不可撤销。")) return;
    setResetting(true);
    try {
      await fetch("/api/reset", { method: "POST" });
      await loadGroups();
    } finally {
      setResetting(false);
    }
  }

  // Fullscreen expand for a single group
  if (expanded !== null) {
    const g = groups[expanded];
    return (
      <div
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8 cursor-pointer"
        onClick={() => setExpanded(null)}
      >
        {g?.imageUrl ? (
          <div
            className="max-w-5xl w-full flex gap-8 items-center animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={g.imageUrl}
              alt={g.productName}
              className="w-1/2 rounded-2xl shadow-2xl"
            />
            <div className="w-1/2 text-white space-y-4">
              <div className="text-rose-400 text-sm font-medium">
                {g.name}
              </div>
              <h2 className="text-3xl font-bold">{g.productName}</h2>
              <p className="text-lg leading-relaxed text-gray-300">
                {g.description}
              </p>
              <button
                onClick={() => setExpanded(null)}
                className="mt-4 text-sm text-gray-500 hover:text-white transition-colors"
              >
                按任意处关闭
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-lg">暂无作品</div>
        )}
      </div>
    );
  }

  const totalGroups = groups.length;
  const submittedCount = groups.filter((g) => g?.submitted).length;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            返回
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">
              展示墙 · 孤独经济创意产品
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {submittedCount}/{totalGroups} 组已提交 · 每 5 秒自动刷新
            </p>
          </div>
          <button
            onClick={handleReset}
            disabled={resetting}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            {resetting ? "重置中..." : "重置全部"}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((g, idx) => (
            <div
              key={idx}
              onClick={() => g?.imageUrl && setExpanded(idx)}
              className={`bg-white rounded-2xl border overflow-hidden transition-all duration-200 ${
                g?.imageUrl
                  ? "border-gray-200 shadow-sm hover:shadow-lg cursor-pointer"
                  : "border-dashed border-gray-300"
              }`}
            >
              {g?.imageUrl ? (
                <>
                  <div className="relative">
                    <img
                      src={g.imageUrl}
                      alt={g.productName}
                      className="w-full aspect-[4/3] object-cover"
                    />
                    {g.submitted && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        已提交
                      </div>
                    )}
                    {!g.submitted && (
                      <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        创作中
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                        {g.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        已生成 {g.generationCount} 次
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {g.productName}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                      {g.description}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <svg
                    className="w-12 h-12 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="text-lg font-medium">
                    {PLACEHOLDER_NAMES[idx]}
                  </span>
                  <span className="text-sm mt-1">等待创作中...</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
