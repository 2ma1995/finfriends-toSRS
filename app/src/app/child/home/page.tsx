import Link from "next/link";
import { Screen } from "@/components/shared/Screen";
import { StarHUD } from "@/components/child/StarHUD";
import { Avatar } from "@/components/child/Avatar";
import { me, wardrobe, todo } from "./home.fixture";

// UX-003 · STR-003 — 아이가 여는 첫 화면
export const metadata = { title: "내 방 · 핀프렌즈" };

export default function ChildHomePage() {
  return (
    <Screen role="아이 화면" title={`${me.name}의 방`} back={{ href: "/", label: "화면 목록" }}>
      <StarHUD balance={me.starBalance} />

      <div className="mt-3 rounded-card border border-line bg-surface py-5 text-center">
        <Avatar {...me.avatar} />
        <p className="mt-2 text-[0.78em] text-ink-mute">아바타 모습은 예시입니다 · 미확정 사양(D4)</p>
      </div>

      <h2 className="mb-1.5 mt-4 text-[0.8em] font-bold">옷장</h2>
      <ul className="grid grid-cols-4 gap-1.5">
        {wardrobe.map((i) => {
          const affordable = me.starBalance >= i.cost;
          return (
            <li key={i.key}
                className={`rounded-card border p-2 text-center ${i.owned ? "border-primary-l bg-primary-bg" : "border-line bg-surface"}`}>
              <div className={`text-[1.5em] ${!i.owned && !affordable ? "opacity-35" : ""}`}>{i.emoji}</div>
              <div className="mt-0.5 text-[0.7em]">{i.name}</div>
              <div className="text-[0.68em] text-ink-mute">
                {i.owned ? "가진 것" : affordable ? `⭐ ${i.cost}` : `⭐ ${i.cost}`}
              </div>
              {!i.owned && !affordable ? (
                <div className="text-[0.62em] text-ink-mute">{i.cost - me.starBalance}개 더</div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <h2 className="mb-1.5 mt-4 text-[0.8em] font-bold">오늘 할 일</h2>
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
