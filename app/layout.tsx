import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loneliness Economy · Startup Competition",
  description: "Lesson 28 Class Activity - Describe your product in Chinese, AI generates concept art",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-800 antialiased">
        {children}
      </body>
    </html>
  );
}
