import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "孤独经济 · 创意产品设计",
  description: "第28课课堂活动 - 用中文描述你的创意产品，AI 帮你生成概念图",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50 text-gray-800 antialiased">
        {children}
      </body>
    </html>
  );
}
