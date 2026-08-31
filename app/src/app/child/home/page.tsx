import Link from "next/link";
import { Screen } from "@/components/shared/Screen";
import { StarHUD } from "@/components/child/StarHUD";
import { RoomStage } from "@/components/child/RoomStage";
import { me, placed, CATEGORIES, byCategory, todo } from "./room.fixture";

// UX-003 · STR-003 · STR-005 — 아이가 여는 첫 화면
export const metadata = { title: "내 방 · 핀프렌즈" };

export default async function ChildHomePage({
  searchParams,
}: {
  searchParams: Promise<{ turn?: string }>;
}) {
  // 🔴 촬영 통로 — 방을 돌린 각도. 헤드리스에서 rAF 가 안 돌아 회전을 증거로 못 남긴다
  const turn = Number((await searchParams).turn ?? 0) || 0;
  const ownedCount = placed.length;

  return (
    <Screen role="아이 화면" title={`${me.name}의 방`} back={{ href: "/", label: "화면 목록" }}>
      <StarHUD balance={me.starBalance} />

      <div className="mt-3 rounded-card border border-line bg-surface py-3">
        <RoomStage items={placed} turn={turn} />
        <p className="mt-1 text-center text-[0.72em] text-ink-mute">
          아바타 · 펫 · 아이템 모습은 예시입니다 · 미확정 사양(D4)
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <h2 className="text-[0.82em] font-bold">내 아이템 {ownedCount}개</h2>
        <Link href="/child/shop" className="text-[0.78em] font-bold text-primary-d">
          별로 바꾸기 →
        </Link>
      </div>

      <ul className="mt-1.5 grid grid-cols-6 gap-1.5">
        {CATEGORIES.map((c) => {
          const mine = byCategory(c.key).filter((i) => i.owned).length;
          const all = byCategory(c.key).length;
          return (
            <li key={c.key}>
              <Link href={`/child/shop?c=${c.key}`}
                    className="grid min-h-touch place-items-center rounded-card border border-line bg-surface py-1.5 text-center">
                <span className="text-[1.2em]">{c.emoji}</span>
                <span className="text-[0.58em] text-ink-mute">{mine}/{all}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <h2 className="mb-1.5 mt-4 text-[0.82em] font-bold">오늘 할 일</h2>
      <ul className="grid gap-1.5">
        {todo.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className="flex min-h-touch items-center gap-2 rounded-card border border-line bg-surface px-3 text-[0.9em]">
              <span className="text-[1.2em]">{t.emoji}</span>{t.label}
            </Link>
          </li>
        ))}
      </ul>
    </Screen>
  );
}
