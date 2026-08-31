import Link from "next/link";
import { Screen, Card } from "@/components/shared/Screen";
import { StarHUD } from "@/components/child/StarHUD";
import { CATEGORIES, byCategory, me, notice, savingHint, type Category } from "./shop.fixture";

// STR-005 — 별로 바꾸는 아이템 상점
export const metadata = { title: "별로 바꾸기 · 핀프렌즈" };

export default async function ChildShopPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const keys = CATEGORIES.map((c) => c.key);
  const raw = (await searchParams).c as Category | undefined;
  const active: Category = raw && keys.includes(raw) ? raw : "pet";
  const items = byCategory(active);

  return (
    <Screen role="아이 화면" title="별로 바꾸기" back={{ href: "/child/home", label: "내 방" }}>
      <StarHUD balance={me.starBalance} />

      {/* 카테고리 탭 — kit 하나가 카테고리 하나다 */}
      <ul className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <li key={c.key} className="shrink-0">
            <Link href={`/child/shop?c=${c.key}`}
                  className={`flex min-h-touch items-center gap-1 rounded-card border px-3 text-[0.82em] ${
                    c.key === active ? "border-primary bg-primary-bg font-bold" : "border-line bg-surface"}`}>
              <span>{c.emoji}</span>{c.label}
            </Link>
          </li>
        ))}
      </ul>

      <ul className="mt-2 grid grid-cols-2 gap-2">
        {items.map((i) => {
          const short = i.cost - me.starBalance;
          const affordable = short <= 0;
          return (
            <li key={i.id}
                className={`rounded-card border p-3 ${i.owned ? "border-primary-l bg-primary-bg" : "border-line bg-surface"}`}>
              <div className="flex items-baseline justify-between">
                <b className="text-[0.88em]">{i.name}</b>
                {i.owned ? <span className="text-[0.7em] text-primary-d">가진 것</span> : null}
              </div>

              {i.owned ? (
                <p className="mt-2 text-[0.76em] text-ink-soft">방에 놓여 있어요</p>
              ) : (
                <>
                  <p className="mt-1 text-[0.86em] tabular-nums text-star-d">⭐ {i.cost}</p>
                  {affordable ? (
                    <button className="mt-2 min-h-touch w-full rounded-card bg-primary text-[0.82em] font-bold text-white">
                      바꾸기
                    </button>
                  ) : (
                    <div className="mt-2 grid gap-1">
                      <div className="h-1.5 overflow-hidden rounded-full bg-line">
                        <div className="h-full rounded-full bg-star"
                             style={{ width: `${Math.round((me.starBalance / i.cost) * 100)}%` }} />
                      </div>
                      <span className="text-[0.72em] text-ink-mute">{short}개 더 모으면 돼요</span>
                    </div>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-3 grid gap-2">
        <Card tone="grow"><p className="text-[0.84em] leading-relaxed">{savingHint}</p></Card>
        <Card><p className="text-[0.82em] leading-relaxed text-ink-soft">{notice}</p></Card>
      </div>
    </Screen>
  );
}
