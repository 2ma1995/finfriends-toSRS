import { Screen } from "@/components/shared/Screen";
import { StarHUD } from "@/components/child/StarHUD";
import Link from "next/link";
import { AvatarStage } from "@/components/child/AvatarStage";
import { me, wardrobe, todo } from "./home.fixture";

// UX-003 · STR-003 — 아이가 여는 첫 화면
export const metadata = { title: "내 방 · 핀프렌즈" };

export default async function ChildHomePage({
  searchParams,
}: {
  searchParams: Promise<{ face?: string; avatar?: string; turn?: string }>;
}) {
  // 🔴 실험 통로 — ?avatar=three 로 three.js 아바타를 켠다. 기본은 CSS 3D.
  const sp = await searchParams;
  const mode = sp.avatar === "three" ? "three" : "css";
  const turn = Number(sp.turn ?? 0) || 0;

  return (
    <Screen role="아이 화면" title={`${me.name}의 방`} back={{ href: "/", label: "화면 목록" }}>
      <StarHUD balance={me.starBalance} />

      <div className="mt-3 rounded-card border border-line bg-surface py-5 text-center">
        <AvatarStage look={me.avatar} mode={mode} turn={turn} />
        <p className="mt-3 text-[0.78em] text-ink-mute">아바타 모습은 예시입니다 · 미확정 사양(D4)</p>
        {/* 🔴 실험 전용 스위치. 고르고 나면 지운다 */}
        <p className="mt-1 text-[0.72em]">
          <Link href={mode === "three" ? "/child/home" : "/child/home?avatar=three"}
                className="text-ink-mute underline underline-offset-2">
            {mode === "three" ? "CSS 3D 로 보기" : "three.js 로 보기"}
          </Link>
        </p>
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
