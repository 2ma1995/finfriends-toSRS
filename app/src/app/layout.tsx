import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "핀프렌즈 — 화면 프로토타입",
  description: "UI/UX 시각 확인용 로컬 프로토타입. 기능은 붙어 있지 않다.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full" style={{ background: "var(--ff-bg)", color: "var(--ff-ink)" }}>
        {children}
      </body>
    </html>
  );
}
