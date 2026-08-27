import { Screen, Card } from "@/components/shared/Screen";
import { StarHUD } from "@/components/child/StarHUD";
import { balance, entries, notice } from "./ledger.fixture";

// STR-001 — 별 원장
export const metadata = { title: "내 별 · 핀프렌즈" };

export default function ChildStarsPage() {
  return (
    <Screen role="아이 화면" title="내 별" back={{ href: "/child/home", label: "내 방" }}>
      <StarHUD balance={balance} earned={1} />

      <ul className="mt-3 grid gap-1.5">
        {entries.map((e) => (
          <li key={e.id} className="flex items-center justify-between rounded-card border border-line bg-surface px-3 py-2">
            <span className="min-w-0">
              <b className="block text-[0.86em]">{e.reason}</b>
              <span className="text-[0.72em] text-ink-mute">{e.when} · {e.kind}</span>
            </span>
            <b className={`shrink-0 tabular-nums text-[0.92em] ${e.delta > 0 ? "text-primary-d" : "text-ink-mute"}`}>
              {e.delta > 0 ? `+${e.delta}` : e.delta}
            </b>
          </li>
        ))}
      </ul>

      <div className="mt-3"><Card><p className="text-[0.84em] leading-relaxed text-ink-soft">{notice}</p></Card></div>
    </Screen>
  );
}
