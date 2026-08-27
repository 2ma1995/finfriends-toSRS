/** 폰 프레임 — 명세 §7.2. 모바일 390px 고정, 데스크톱에서 가운데 정렬. */
export function PhoneFrame({ role, title, sub, children }: {
  role: string; title: string; sub?: string; children: React.ReactNode;
}) {
  return (
    <div
      className="w-[390px] max-w-full overflow-hidden rounded-[26px] border"
      style={{ background: "var(--ff-paper)", borderColor: "var(--ff-line-2)",
               boxShadow: "0 1px 2px rgba(42,39,36,.05), 0 14px 34px rgba(42,39,36,.09)" }}
    >
      <div className="flex justify-between px-[18px] pt-[9px] text-[0.66rem] tabular-nums"
           style={{ color: "var(--ff-ink-3)" }}>
        <span>9:41</span><span>▮▮▮</span>
      </div>
      <div className="px-[18px] pb-[22px] pt-[14px]">
        <div className="text-[0.66rem] tracking-[0.06em]" style={{ color: "var(--ff-ink-3)" }}>{role}</div>
        <div className="ff-serif mb-[2px] mt-[3px] text-[1.24rem] font-bold tracking-[-0.01em]">{title}</div>
        {sub ? <div className="mb-[14px] text-[0.74rem]" style={{ color: "var(--ff-ink-3)" }}>{sub}</div> : null}
        {children}
      </div>
    </div>
  );
}

/** 빈 상태 — 흰 화면을 만들지 않는다. 안내 + 다음 행동 (ACE-1.1 · 스킬 401) */
export function EmptyNotice({ emoji, title, body, hint }: {
  emoji: string; title: string; body: string; hint?: string;
}) {
  return (
    <div className="rounded-[13px] border border-dashed px-4 py-[22px] text-center"
         style={{ background: "var(--ff-sand)", borderColor: "var(--ff-line-2)" }}>
      <div className="text-[1.6rem]">{emoji}</div>
      <p className="mt-[7px] text-[0.82rem] leading-[1.55]" style={{ color: "var(--ff-ink-2)" }}>
        <b style={{ color: "var(--ff-ink)" }}>{title}</b><br />{body}
      </p>
      {hint ? <small className="mt-[7px] block text-[0.71rem]" style={{ color: "var(--ff-ink-3)" }}>{hint}</small> : null}
    </div>
  );
}
